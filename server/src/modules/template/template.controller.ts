import { Request, Response, NextFunction } from "express";
import { TemplateService } from "./template.service";
import { UpdateDesignDto } from "../../types/dtos";

export class TemplateController {
  private templateService: TemplateService;

  constructor() {
    this.templateService = new TemplateService();
  }

  listTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templates = await this.templateService.getTemplates();

      res.status(200).json({
        success: true,
        data: templates,
      });
    } catch (error) {
      next(error);
    }
  };

  getTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await this.templateService.getTemplateById(templateId);

      res.status(200).json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  };

  applyTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);
      const { templateId, themeId } = req.body;

      await this.templateService.applyTemplate(userId, resumeId, templateId, themeId);

      res.status(200).json({
        success: true,
        message: "Template applied successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateDesign = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);
      const data: UpdateDesignDto = req.body;

      await this.templateService.updateDesignOverrides(userId, resumeId, data);

      res.status(200).json({
        success: true,
        message: "Design updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getDesign = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);

      const design = await this.templateService.getResumeDesign(userId, resumeId);

      res.status(200).json({
        success: true,
        data: design,
      });
    } catch (error) {
      next(error);
    }
  };
}
