import { Request, Response, NextFunction } from "express";
import { PDFService } from "./pdf.service";
import { ResumeService } from "../resume/resume.service";
import { SharingService } from "../sharing/sharing.service";

export class PDFController {
  private pdfService: PDFService;
  private resumeService: ResumeService;
  private sharingService: SharingService;

  constructor() {
    this.pdfService = new PDFService();
    this.resumeService = new ResumeService();
    this.sharingService = new SharingService();
  }

  downloadPDF = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const resumeId = parseInt(req.params.id);

      // Get resume data
      const resume = await this.resumeService.getResumeById(userId, resumeId);

      // Generate PDF
      const pdfBuffer = await this.pdfService.generatePDF(resume);

      // Set headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${resume.title}.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length);

      // Send PDF buffer
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };

  downloadPublicPDF = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug;
      const password = req.body.password;

      // Get public resume data
      const resume = await this.sharingService.getPublicResume(slug, password);

      // Generate PDF
      const pdfBuffer = await this.pdfService.generatePDF(resume as any);

      // Set headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${resume.title}.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length);

      // Send PDF buffer
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };
}
