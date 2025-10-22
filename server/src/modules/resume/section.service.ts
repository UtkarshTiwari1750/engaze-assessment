import prisma from "../../config/prisma";
import {
  CreateSectionDto,
  UpdateSectionDto,
  ReorderSectionsDto,
  SectionResponseDto,
} from "../../types/dtos";
import { NotFoundError, ValidationError } from "../../middleware/error.middleware";

export class SectionService {
  async createSection(
    userId: number,
    resumeId: number,
    data: CreateSectionDto
  ): Promise<SectionResponseDto> {
    // Verify resume ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    });

    if (!resume) {
      throw new NotFoundError("Resume not found");
    }

    // Verify section type exists
    const sectionType = await prisma.sectionType.findUnique({
      where: { id: data.sectionTypeId },
    });

    if (!sectionType) {
      throw new ValidationError("Section type not found");
    }

    // Check singleton constraint
    if (sectionType.isSingleton) {
      const existingSection = await prisma.resumeSection.findFirst({
        where: {
          resumeId,
          sectionTypeId: data.sectionTypeId,
        },
      });

      if (existingSection) {
        throw new ValidationError("Only one section of this type is allowed");
      }
    }

    // Get next position
    let position = data.position;
    if (position === undefined) {
      const lastSection = await prisma.resumeSection.findFirst({
        where: { resumeId },
        orderBy: { position: "desc" },
      });
      position = (lastSection?.position || 0) + 1;
    }

    const section = await prisma.resumeSection.create({
      data: {
        resumeId,
        sectionTypeId: data.sectionTypeId,
        heading: data.heading,
        position,
        visible: true,
        layoutConfig: {},
      },
      include: {
        sectionType: true,
        items: {
          orderBy: { position: "asc" },
        },
      },
    });

    return {
      id: section.id,
      sectionTypeId: section.sectionTypeId,
      heading: section.heading,
      position: section.position,
      visible: section.visible,
      layoutConfig: section.layoutConfig,
      items: section.items.map((item) => ({
        id: item.id,
        position: item.position,
        dataJson: item.dataJson,
      })),
      sectionType: {
        key: section.sectionType.key,
        name: section.sectionType.name,
        isSingleton: section.sectionType.isSingleton,
      },
    };
  }

  async updateSection(
    userId: number,
    resumeId: number,
    sectionId: number,
    data: UpdateSectionDto
  ): Promise<SectionResponseDto> {
    // Verify ownership
    const section = await prisma.resumeSection.findFirst({
      where: {
        id: sectionId,
        resume: {
          id: resumeId,
          userId,
        },
      },
    });

    if (!section) {
      throw new NotFoundError("Section not found");
    }

    const updatedSection = await prisma.resumeSection.update({
      where: { id: sectionId },
      data: {
        ...(data.heading && { heading: data.heading }),
        ...(data.visible !== undefined && { visible: data.visible }),
        ...(data.layoutConfig && { layoutConfig: data.layoutConfig }),
      },
      include: {
        sectionType: true,
        items: {
          orderBy: { position: "asc" },
        },
      },
    });

    return {
      id: updatedSection.id,
      sectionTypeId: updatedSection.sectionTypeId,
      heading: updatedSection.heading,
      position: updatedSection.position,
      visible: updatedSection.visible,
      layoutConfig: updatedSection.layoutConfig,
      items: updatedSection.items.map((item) => ({
        id: item.id,
        position: item.position,
        dataJson: item.dataJson,
      })),
      sectionType: {
        key: updatedSection.sectionType.key,
        name: updatedSection.sectionType.name,
        isSingleton: updatedSection.sectionType.isSingleton,
      },
    };
  }

  async deleteSection(userId: number, resumeId: number, sectionId: number): Promise<void> {
    // Verify ownership
    const section = await prisma.resumeSection.findFirst({
      where: {
        id: sectionId,
        resume: {
          id: resumeId,
          userId,
        },
      },
    });

    if (!section) {
      throw new NotFoundError("Section not found");
    }

    await prisma.$transaction(async (tx) => {
      // Delete section (items will be deleted by cascade)
      await tx.resumeSection.delete({
        where: { id: sectionId },
      });

      // Reorder remaining sections
      await tx.resumeSection.updateMany({
        where: {
          resumeId,
          position: {
            gt: section.position,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });
    });
  }

  async reorderSections(userId: number, resumeId: number, data: ReorderSectionsDto): Promise<void> {
    // Verify resume ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    });

    if (!resume) {
      throw new NotFoundError("Resume not found");
    }

    // Update positions in transaction
    await prisma.$transaction(async (tx) => {
      for (const section of data.sections) {
        await tx.resumeSection.updateMany({
          where: {
            id: section.id,
            resumeId,
          },
          data: {
            position: section.position,
          },
        });
      }
    });
  }

  async getSectionTypes() {
    return await prisma.sectionType.findMany({
      orderBy: { name: "asc" },
    });
  }
}
