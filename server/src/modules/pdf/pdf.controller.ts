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

      if (!resume) {
        return res.status(404).json({ success: false, message: "Resume not found" });
      }

      // Generate PDF
      const pdfBuffer = await this.pdfService.generatePDF(resume);

      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error("PDF generation failed - empty buffer");
      }

      // Set headers for PDF download
      if (!res.headersSent) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Transfer-Encoding", "binary");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Content-Disposition", `attachment; filename="${resume.title}.pdf"`);
        res.setHeader("Content-Length", pdfBuffer.length);
      }

      // Send PDF buffer
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "PDF generation failed" });
      }
    }
  };

  downloadPublicPDF = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug;
      const password = req.body.password;

      // Get public resume data
      const resume = await this.sharingService.getPublicResume(slug, password);

      if (!resume) {
        return res.status(404).json({ success: false, message: "Resume not found" });
      }

      // Generate PDF
      const pdfBuffer = await this.pdfService.generatePDF(resume as any);

      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error("PDF generation failed - empty buffer");
      }

      // Set headers for PDF download
      if (!res.headersSent) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Transfer-Encoding", "binary");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Content-Disposition", `attachment; filename="${resume.title}.pdf"`);
        res.setHeader("Content-Length", pdfBuffer.length);
      }

      // Send PDF buffer
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "PDF generation failed" });
      }
    }
  };
}
