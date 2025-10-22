import prisma from "../../config/prisma";
import { UpdateDesignDto, TemplateResponseDto, DesignResponseDto } from "../../types/dtos";
import { NotFoundError } from "../../middleware/error.middleware";

export class TemplateService {
  async getTemplates(): Promise<TemplateResponseDto[]> {
    const templates = await prisma.template.findMany({
      where: { isPublic: true },
      include: {
        themes: true,
      },
      orderBy: { name: "asc" },
    });

    return templates.map((template) => ({
      id: template.id,
      key: template.key,
      name: template.name,
      description: template.description,
      previewImage: template.previewImage,
      layoutConfig: template.layoutConfig,
      themes: template.themes.map((theme) => ({
        id: theme.id,
        templateId: theme.templateId,
        name: theme.name,
        colorScheme: theme.colorScheme,
        typography: theme.typography,
        spacing: theme.spacing,
      })),
    }));
  }

  async getTemplateById(templateId: number): Promise<TemplateResponseDto> {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        themes: true,
      },
    });

    if (!template) {
      throw new NotFoundError("Template not found");
    }

    return {
      id: template.id,
      key: template.key,
      name: template.name,
      description: template.description,
      previewImage: template.previewImage,
      layoutConfig: template.layoutConfig,
      themes: template.themes.map((theme) => ({
        id: theme.id,
        templateId: theme.templateId,
        name: theme.name,
        colorScheme: theme.colorScheme,
        typography: theme.typography,
        spacing: theme.spacing,
      })),
    };
  }

  async applyTemplate(
    userId: number,
    resumeId: number,
    templateId: number,
    themeId?: number
  ): Promise<void> {
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

    // Verify template exists
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundError("Template not found");
    }

    // Verify theme exists if provided
    if (themeId) {
      const theme = await prisma.theme.findFirst({
        where: {
          id: themeId,
          templateId,
        },
      });

      if (!theme) {
        throw new NotFoundError("Theme not found");
      }
    }

    // Update or create resume template
    await prisma.resumeTemplate.upsert({
      where: { resumeId },
      update: {
        templateId,
        themeId,
        customOverrides: {},
      },
      create: {
        resumeId,
        templateId,
        themeId,
        customOverrides: {},
      },
    });
  }

  async updateDesignOverrides(
    userId: number,
    resumeId: number,
    data: UpdateDesignDto
  ): Promise<void> {
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

    // Get current resume template
    const resumeTemplate = await prisma.resumeTemplate.findUnique({
      where: { resumeId },
    });

    if (!resumeTemplate) {
      throw new NotFoundError("Resume template not found");
    }

    const updateData: any = {};

    if (data.templateId) {
      updateData.templateId = data.templateId;
    }

    if (data.themeId) {
      updateData.themeId = data.themeId;
    }

    if (data.customOverrides) {
      updateData.customOverrides = data.customOverrides;
    }

    await prisma.resumeTemplate.update({
      where: { resumeId },
      data: updateData,
    });
  }

  async getResumeDesign(userId: number, resumeId: number): Promise<DesignResponseDto> {
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

    const resumeTemplate = await prisma.resumeTemplate.findUnique({
      where: { resumeId },
      include: {
        template: {
          include: {
            themes: true,
          },
        },
        theme: true,
      },
    });

    if (!resumeTemplate) {
      throw new NotFoundError("Resume template not found");
    }

    return {
      templateId: resumeTemplate.templateId,
      themeId: resumeTemplate.themeId,
      customOverrides: resumeTemplate.customOverrides,
      template: {
        id: resumeTemplate.template.id,
        key: resumeTemplate.template.key,
        name: resumeTemplate.template.name,
        description: resumeTemplate.template.description,
        previewImage: resumeTemplate.template.previewImage,
        layoutConfig: resumeTemplate.template.layoutConfig,
        themes: resumeTemplate.template.themes.map((theme) => ({
          id: theme.id,
          templateId: theme.templateId,
          name: theme.name,
          colorScheme: theme.colorScheme,
          typography: theme.typography,
          spacing: theme.spacing,
        })),
      },
      theme: resumeTemplate.theme
        ? {
            id: resumeTemplate.theme.id,
            templateId: resumeTemplate.theme.templateId,
            name: resumeTemplate.theme.name,
            colorScheme: resumeTemplate.theme.colorScheme,
            typography: resumeTemplate.theme.typography,
            spacing: resumeTemplate.theme.spacing,
          }
        : undefined,
    };
  }
}
