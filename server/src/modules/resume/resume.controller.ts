import { Request, Response, NextFunction } from "express";
import { ResumeService } from "./resume.service";
import { SectionService } from "./section.service";
import { ItemService } from "./item.service";
import {
  CreateResumeDto,
  UpdateResumeDto,
  CreateSectionDto,
  UpdateSectionDto,
  ReorderSectionsDto,
  CreateItemDto,
  UpdateItemDto,
  ReorderItemsDto,
} from "../../types/dtos";

export class ResumeController {
  private resumeService: ResumeService;
  private sectionService: SectionService;
  private itemService: ItemService;

  constructor() {
    this.resumeService = new ResumeService();
    this.sectionService = new SectionService();
    this.itemService = new ItemService();
  }

  // Resume methods
  createResume = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data: CreateResumeDto = req.body;
      const resume = await this.resumeService.createResume(userId, data);

      res.status(201).json({
        success: true,
        data: resume,
      });
    } catch (error) {
      next(error);
    }
  };

  getResume = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);
      const resume = await this.resumeService.getResumeById(userId, resumeId);

      res.status(200).json({
        success: true,
        data: resume,
      });
    } catch (error) {
      next(error);
    }
  };

  listResumes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.resumeService.getUserResumes(userId, page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateResume = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);
      const data: UpdateResumeDto = req.body;

      const resume = await this.resumeService.updateResume(userId, resumeId, data);

      res.status(200).json({
        success: true,
        data: resume,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteResume = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);

      await this.resumeService.deleteResume(userId, resumeId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // Section methods
  createSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);
      const data: CreateSectionDto = req.body;

      const section = await this.sectionService.createSection(userId, resumeId, data);

      res.status(201).json({
        success: true,
        data: section,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);
      const sectionId = parseInt(req.params.sectionId);
      const data: UpdateSectionDto = req.body;

      const section = await this.sectionService.updateSection(userId, resumeId, sectionId, data);

      res.status(200).json({
        success: true,
        data: section,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);
      const sectionId = parseInt(req.params.sectionId);

      await this.sectionService.deleteSection(userId, resumeId, sectionId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  reorderSections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);
      const data: ReorderSectionsDto = req.body;

      await this.sectionService.reorderSections(userId, resumeId, data);

      res.status(200).json({
        success: true,
        message: "Sections reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getSectionTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sectionTypes = await this.sectionService.getSectionTypes();

      res.status(200).json({
        success: true,
        data: sectionTypes,
      });
    } catch (error) {
      next(error);
    }
  };

  // Item methods
  createItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);
      const sectionId = parseInt(req.params.sectionId);
      const data: CreateItemDto = req.body;

      const item = await this.itemService.createItem(userId, resumeId, sectionId, data);

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);
      const sectionId = parseInt(req.params.sectionId);
      const itemId = parseInt(req.params.itemId);
      const data: UpdateItemDto = req.body;

      const item = await this.itemService.updateItem(userId, resumeId, sectionId, itemId, data);

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);
      const sectionId = parseInt(req.params.sectionId);
      const itemId = parseInt(req.params.itemId);

      await this.itemService.deleteItem(userId, resumeId, sectionId, itemId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  reorderItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);
      const sectionId = parseInt(req.params.sectionId);
      const data: ReorderItemsDto = req.body;

      await this.itemService.reorderItems(userId, resumeId, sectionId, data);

      res.status(200).json({
        success: true,
        message: "Items reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
