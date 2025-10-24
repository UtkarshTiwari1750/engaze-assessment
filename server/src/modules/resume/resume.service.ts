import prisma from "../../config/prisma";
import { generateUniqueSlug } from "../../utils/slug.util";
import {
  CreateResumeDto,
  UpdateResumeDto,
  ResumeResponseDto,
  ResumeListItemDto,
} from "../../types/dtos";
import { NotFoundError, ValidationError } from "../../middleware/error.middleware";

export class ResumeService {
  async createResume(userId: number, data: CreateResumeDto): Promise<ResumeResponseDto> {
    const { title, templateId, themeId } = data;
    const slug = generateUniqueSlug(title);

    // Get default template if not provided
    let defaultTemplate = null;
    if (templateId) {
      defaultTemplate = await prisma.template.findUnique({
        where: { id: templateId },
      });
      if (!defaultTemplate) {
        throw new ValidationError("Template not found");
      }
    } else {
      defaultTemplate = await prisma.template.findFirst({
        where: { key: "modern" },
      });
    }

    const resume = await prisma.$transaction(async (tx) => {
      // Create resume
      const newResume = await tx.resume.create({
        data: {
          userId,
          title,
          slug,
          status: "draft",
        },
      });

      // Create template association
      if (defaultTemplate) {
        await tx.resumeTemplate.create({
          data: {
            resumeId: newResume.id,
            templateId: defaultTemplate.id,
            themeId: themeId || null,
            customOverrides: {},
          },
        });
      }

      return newResume;
    });

    return this.getResumeById(userId, resume.id);
  }

  async getResumeById(userId: number, resumeId: number): Promise<ResumeResponseDto> {
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
      include: {
        sections: {
          include: {
            sectionType: true,
            items: {
              orderBy: { position: "asc" },
            },
          },
          orderBy: { position: "asc" },
        },
        template: {
          include: {
            template: {
              include: {
                themes: true,
              },
            },
            theme: true,
          },
        },
      },
    });

    if (!resume) {
      throw new NotFoundError("Resume not found");
    }

    return {
      id: resume.id,
      userId: resume.userId,
      title: resume.title,
      slug: resume.slug,
      status: resume.status,
      sections: resume.sections.map((section) => ({
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
      })),
      template: resume.template
        ? {
            templateId: resume.template.templateId,
            themeId: resume.template.themeId,
            customOverrides: resume.template.customOverrides,
          }
        : undefined,
      createdAt: resume.createdAt.toISOString(),
      updatedAt: resume.updatedAt.toISOString(),
    };
  }

  async getUserResumes(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ resumes: ResumeListItemDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const [resumes, total] = await Promise.all([
      prisma.resume.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.resume.count({
        where: { userId },
      }),
    ]);

    return {
      resumes: resumes.map((resume) => ({
        id: resume.id,
        title: resume.title,
        slug: resume.slug,
        status: resume.status,
        updatedAt: resume.updatedAt.toISOString(),
      })),
      total,
    };
  }

  async updateResume(
    userId: number,
    resumeId: number,
    data: UpdateResumeDto
  ): Promise<ResumeResponseDto> {
    const updateData: any = {};

    if (data.title) {
      updateData.title = data.title;
      updateData.slug = generateUniqueSlug(data.title);
    }

    if (data.status) {
      updateData.status = data.status;
    }

    const resume = await prisma.resume.updateMany({
      where: {
        id: resumeId,
        userId,
      },
      data: updateData,
    });

    if (resume.count === 0) {
      throw new NotFoundError("Resume not found");
    }

    return this.getResumeById(userId, resumeId);
  }

  async deleteResume(userId: number, resumeId: number): Promise<void> {
    const result = await prisma.resume.deleteMany({
      where: {
        id: resumeId,
        userId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundError("Resume not found");
    }
  }

  async createVersion(userId: number, resumeId: number): Promise<void> {
    // Get current resume state
    const resume = await this.getResumeById(userId, resumeId);

    // Get next version number
    const lastVersion = await prisma.resumeVersion.findFirst({
      where: { resumeId },
      orderBy: { versionNum: "desc" },
    });

    const nextVersionNum = (lastVersion?.versionNum || 0) + 1;

    // Create version snapshot
    await prisma.resumeVersion.create({
      data: {
        resumeId,
        versionNum: nextVersionNum,
        snapshotJson: resume,
      },
    });

    // Keep only last 50 versions
    const versionsToDelete = await prisma.resumeVersion.findMany({
      where: { resumeId },
      orderBy: { versionNum: "desc" },
      skip: 50,
    });

    if (versionsToDelete.length > 0) {
      await prisma.resumeVersion.deleteMany({
        where: {
          id: {
            in: versionsToDelete.map((v) => v.id),
          },
        },
      });
    }
  }

  async restoreVersion(
    userId: number,
    resumeId: number,
    versionNum: number
  ): Promise<ResumeResponseDto> {
    const version = await prisma.resumeVersion.findFirst({
      where: {
        resumeId,
        versionNum,
      },
    });

    if (!version) {
      throw new NotFoundError("Version not found");
    }

    // Verify ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    });

    if (!resume) {
      throw new NotFoundError("Resume not found");
    }

    const snapshotData = version.snapshotJson as any;

    await prisma.$transaction(async (tx) => {
      // Delete existing sections and items
      await tx.sectionItem.deleteMany({
        where: {
          section: {
            resumeId,
          },
        },
      });

      await tx.resumeSection.deleteMany({
        where: { resumeId },
      });

      // Restore sections from snapshot
      if (snapshotData.sections) {
        for (const sectionData of snapshotData.sections) {
          const section = await tx.resumeSection.create({
            data: {
              resumeId,
              sectionTypeId: sectionData.sectionTypeId,
              heading: sectionData.heading,
              position: sectionData.position,
              visible: sectionData.visible,
              layoutConfig: sectionData.layoutConfig || {},
            },
          });

          // Restore items for this section
          if (sectionData.items) {
            for (const itemData of sectionData.items) {
              await tx.sectionItem.create({
                data: {
                  sectionId: section.id,
                  position: itemData.position,
                  dataJson: itemData.dataJson,
                },
              });
            }
          }
        }
      }

      // Update resume metadata if present in snapshot
      if (snapshotData.title || snapshotData.status) {
        await tx.resume.update({
          where: { id: resumeId },
          data: {
            ...(snapshotData.title && { title: snapshotData.title }),
            ...(snapshotData.status && { status: snapshotData.status }),
          },
        });
      }

      // Restore template settings if present
      if (snapshotData.template) {
        await tx.resumeTemplate.upsert({
          where: { resumeId },
          update: {
            templateId: snapshotData.template.templateId,
            themeId: snapshotData.template.themeId,
            customOverrides: snapshotData.template.customOverrides || {},
          },
          create: {
            resumeId,
            templateId: snapshotData.template.templateId,
            themeId: snapshotData.template.themeId,
            customOverrides: snapshotData.template.customOverrides || {},
          },
        });
      }
    });

    return this.getResumeById(userId, resumeId);
  }
}
