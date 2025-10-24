import { Request, Response, NextFunction } from "express";
import { SharingService } from "./sharing.service";
import { CreateSharingLinkDto, UpdateSharingLinkDto } from "../../types/dtos";

export class SharingController {
  private sharingService: SharingService;

  constructor() {
    this.sharingService = new SharingService();
  }

  createLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);
      const data: CreateSharingLinkDto = req.body;

      const link = await this.sharingService.createSharingLink(userId, resumeId, data);

      res.status(201).json({
        success: true,
        data: link,
      });
    } catch (error) {
      next(error);
    }
  };

  listLinks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);

      const links = await this.sharingService.getSharingLinks(userId, resumeId);

      res.status(200).json({
        success: true,
        data: links,
      });
    } catch (error) {
      next(error);
    }
  };

  updateLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const linkId = parseInt(req.params.linkId);
      const data: UpdateSharingLinkDto = req.body;

      const link = await this.sharingService.updateSharingLink(userId, linkId, data);

      res.status(200).json({
        success: true,
        data: link,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const linkId = parseInt(req.params.linkId);

      await this.sharingService.deleteSharingLink(userId, linkId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getPublicResume = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug;
      // For GET requests, password comes from query params
      const password = req.query.password as string;

      const resume = await this.sharingService.getPublicResume(slug, password);

      res.status(200).json({
        success: true,
        data: resume,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug;
      const { password } = req.body;

      const isValid = await this.sharingService.verifyPassword(slug, password);

      res.status(200).json({
        success: true,
        data: { valid: isValid },
      });
    } catch (error) {
      next(error);
    }
  };
}
