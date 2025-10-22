import prisma from "../../config/prisma";
import { generateRandomSlug } from "../../utils/slug.util";
import { hashPassword, comparePassword } from "../../utils/password.util";
import {
  CreateSharingLinkDto,
  UpdateSharingLinkDto,
  SharingLinkResponseDto,
} from "../../types/dtos";
import { NotFoundError, UnauthorizedError } from "../../middleware/error.middleware";

export class SharingService {
  async createSharingLink(
    userId: number,
    resumeId: number,
    data: CreateSharingLinkDto
  ): Promise<SharingLinkResponseDto> {
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

    // Generate unique slug
    let slug: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      slug = generateRandomSlug(8);
      const existing = await prisma.sharingLink.findUnique({
        where: { slug },
      });
      isUnique = !existing;
      attempts++;
    }

    if (!isUnique) {
      throw new Error("Failed to generate unique slug");
    }

    // Hash password if provided
    let passwordHash: string | null = null;
    if (data.password) {
      passwordHash = await hashPassword(data.password);
    }

    // Parse expiry date
    let expiresAt: Date | null = null;
    if (data.expiresAt) {
      expiresAt = new Date(data.expiresAt);
    }

    const sharingLink = await prisma.sharingLink.create({
      data: {
        resumeId,
        slug: slug!,
        visibility: data.visibility,
        passwordHash,
        expiresAt,
      },
    });

    return {
      id: sharingLink.id,
      resumeId: sharingLink.resumeId,
      slug: sharingLink.slug,
      visibility: sharingLink.visibility,
      expiresAt: sharingLink.expiresAt?.toISOString(),
      createdAt: sharingLink.createdAt.toISOString(),
    };
  }

  async getSharingLinks(userId: number, resumeId: number): Promise<SharingLinkResponseDto[]> {
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

    const links = await prisma.sharingLink.findMany({
      where: { resumeId },
      orderBy: { createdAt: "desc" },
    });

    return links.map((link) => ({
      id: link.id,
      resumeId: link.resumeId,
      slug: link.slug,
      visibility: link.visibility,
      expiresAt: link.expiresAt?.toISOString(),
      createdAt: link.createdAt.toISOString(),
    }));
  }

  async updateSharingLink(
    userId: number,
    linkId: number,
    data: UpdateSharingLinkDto
  ): Promise<SharingLinkResponseDto> {
    // Verify ownership through resume
    const link = await prisma.sharingLink.findFirst({
      where: {
        id: linkId,
        resume: {
          userId,
        },
      },
    });

    if (!link) {
      throw new NotFoundError("Sharing link not found");
    }

    const updateData: any = {};

    if (data.visibility) {
      updateData.visibility = data.visibility;
    }

    if (data.password !== undefined) {
      updateData.passwordHash = data.password ? await hashPassword(data.password) : null;
    }

    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    }

    const updatedLink = await prisma.sharingLink.update({
      where: { id: linkId },
      data: updateData,
    });

    return {
      id: updatedLink.id,
      resumeId: updatedLink.resumeId,
      slug: updatedLink.slug,
      visibility: updatedLink.visibility,
      expiresAt: updatedLink.expiresAt?.toISOString(),
      createdAt: updatedLink.createdAt.toISOString(),
    };
  }

  async deleteSharingLink(userId: number, linkId: number): Promise<void> {
    // Verify ownership through resume
    const result = await prisma.sharingLink.deleteMany({
      where: {
        id: linkId,
        resume: {
          userId,
        },
      },
    });

    if (result.count === 0) {
      throw new NotFoundError("Sharing link not found");
    }
  }

  async getPublicResume(slug: string, password?: string) {
    const sharingLink = await prisma.sharingLink.findUnique({
      where: { slug },
      include: {
        resume: {
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
        },
      },
    });

    if (!sharingLink) {
      throw new NotFoundError("Resume not found");
    }

    // Check if expired
    if (sharingLink.expiresAt && sharingLink.expiresAt < new Date()) {
      throw new NotFoundError("Resume link has expired");
    }

    // Check password if required
    if (sharingLink.passwordHash) {
      if (!password) {
        throw new UnauthorizedError("Password required");
      }

      const isValidPassword = await comparePassword(password, sharingLink.passwordHash);
      if (!isValidPassword) {
        throw new UnauthorizedError("Invalid password");
      }
    }

    const resume = sharingLink.resume;

    return {
      id: resume.id,
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

  async verifyPassword(slug: string, password: string): Promise<boolean> {
    const sharingLink = await prisma.sharingLink.findUnique({
      where: { slug },
    });

    if (!sharingLink || !sharingLink.passwordHash) {
      return false;
    }

    return await comparePassword(password, sharingLink.passwordHash);
  }
}
