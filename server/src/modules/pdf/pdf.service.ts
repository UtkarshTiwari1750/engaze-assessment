import { Document, Page, Text, View, StyleSheet, Font, pdf } from "@react-pdf/renderer";
import React from "react";
import { ResumeResponseDto } from "../../types/dtos";

// Register fonts (you would need to add font files to your project)
// Font.register({
//   family: 'Inter',
//   src: 'path/to/Inter-Regular.ttf'
// });

export class PDFService {
  async generatePDF(resume: ResumeResponseDto): Promise<Buffer> {
    try {
      // Validate resume data
      if (!resume) {
        throw new Error("Resume data is required");
      }

      if (!resume.sections || resume.sections.length === 0) {
        console.warn("Resume has no sections, generating empty PDF");
      }
      const MyDocument = React.createElement(Document, {}, [
        React.createElement(Page, { key: "page1", size: "A4", style: styles.page }, [
          React.createElement(View, { key: "header", style: styles.header }, [
            React.createElement(Text, { key: "title", style: styles.title }, resume.title),
          ]),
          React.createElement(
            View,
            { key: "content", style: styles.content },
            resume.sections
              .filter((section) => section.visible)
              .map((section, index) =>
                React.createElement(View, { key: `section-${section.id}`, style: styles.section }, [
                  React.createElement(
                    Text,
                    { key: `heading-${section.id}`, style: styles.sectionHeading },
                    section.heading
                  ),
                  React.createElement(
                    View,
                    { key: `items-${section.id}` },
                    section.items.map((item, itemIndex) =>
                      this.renderSectionItem(section.sectionType.key, item, itemIndex)
                    )
                  ),
                ])
              )
          ),
        ]),
      ]);

      const pdfBuffer = await pdf(MyDocument).toBuffer();

      // Verify PDF buffer is valid
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error("PDF generation resulted in empty buffer");
      }

      console.log(`PDF generated successfully, size: ${pdfBuffer.length} bytes`);
      return pdfBuffer;
    } catch (error) {
      console.error("PDF generation failed:", error);
      throw new Error(
        `PDF generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private renderSectionItem(sectionType: string, item: any, index: number) {
    const data = item.dataJson || {};

    switch (sectionType) {
      case "summary":
        return React.createElement(
          Text,
          { key: `item-${index}`, style: styles.text },
          data.text || ""
        );

      case "experience":
        return React.createElement(View, { key: `item-${index}`, style: styles.experienceItem }, [
          React.createElement(View, { key: "header", style: styles.experienceHeader }, [
            React.createElement(Text, { key: "role", style: styles.jobTitle }, data.role || ""),
            React.createElement(
              Text,
              { key: "company", style: styles.company },
              data.company || ""
            ),
            React.createElement(
              Text,
              { key: "dates", style: styles.dates },
              `${data.startDate || ""} - ${data.current ? "Present" : data.endDate || ""}`
            ),
          ]),
          data.location &&
            React.createElement(Text, { key: "location", style: styles.location }, data.location),
          data.description &&
            Array.isArray(data.description) &&
            React.createElement(
              View,
              { key: "description" },
              data.description.map((bullet: string, bulletIndex: number) =>
                React.createElement(
                  Text,
                  { key: `bullet-${bulletIndex}`, style: styles.bullet },
                  `• ${bullet}`
                )
              )
            ),
        ]);

      case "education":
        return React.createElement(View, { key: `item-${index}`, style: styles.educationItem }, [
          React.createElement(
            Text,
            { key: "degree", style: styles.degree },
            `${data.degree || ""} ${data.field ? `in ${data.field}` : ""}`
          ),
          React.createElement(Text, { key: "school", style: styles.school }, data.school || ""),
          React.createElement(
            Text,
            { key: "dates", style: styles.dates },
            `${data.startDate || ""} - ${data.endDate || ""}`
          ),
          data.gpa &&
            React.createElement(Text, { key: "gpa", style: styles.gpa }, `GPA: ${data.gpa}`),
          data.honors &&
            React.createElement(Text, { key: "honors", style: styles.honors }, data.honors),
        ]);

      case "skills":
        return React.createElement(
          View,
          { key: `item-${index}` },
          data.categories &&
            Array.isArray(data.categories) &&
            data.categories.map((category: any, catIndex: number) =>
              React.createElement(
                View,
                { key: `category-${catIndex}`, style: styles.skillCategory },
                [
                  React.createElement(
                    Text,
                    { key: "name", style: styles.skillCategoryName },
                    category.name || ""
                  ),
                  React.createElement(
                    Text,
                    { key: "skills", style: styles.skillList },
                    Array.isArray(category.skills) ? category.skills.join(", ") : ""
                  ),
                ]
              )
            )
        );

      case "projects":
        return React.createElement(View, { key: `item-${index}`, style: styles.projectItem }, [
          React.createElement(Text, { key: "name", style: styles.projectName }, data.name || ""),
          data.url && React.createElement(Text, { key: "url", style: styles.projectUrl }, data.url),
          data.role &&
            React.createElement(Text, { key: "role", style: styles.projectRole }, data.role),
          data.description &&
            React.createElement(Text, { key: "description", style: styles.text }, data.description),
          data.technologies &&
            Array.isArray(data.technologies) &&
            React.createElement(
              Text,
              { key: "tech", style: styles.technologies },
              `Technologies: ${data.technologies.join(", ")}`
            ),
        ]);

      default:
        return React.createElement(
          Text,
          { key: `item-${index}`, style: styles.text },
          JSON.stringify(data)
        );
    }
  }
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "1pt solid #000000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    flexDirection: "column",
  },
  section: {
    marginBottom: 15,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2563eb",
    borderBottom: "0.5pt solid #2563eb",
    paddingBottom: 2,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: "bold",
  },
  company: {
    fontSize: 12,
    fontWeight: "bold",
  },
  dates: {
    fontSize: 10,
    color: "#666666",
  },
  location: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 4,
  },
  bullet: {
    fontSize: 11,
    marginBottom: 2,
    marginLeft: 10,
  },
  educationItem: {
    marginBottom: 8,
  },
  degree: {
    fontSize: 12,
    fontWeight: "bold",
  },
  school: {
    fontSize: 11,
    marginBottom: 2,
  },
  gpa: {
    fontSize: 10,
    color: "#666666",
  },
  honors: {
    fontSize: 10,
    color: "#666666",
  },
  skillCategory: {
    marginBottom: 6,
  },
  skillCategoryName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  skillList: {
    fontSize: 11,
    marginLeft: 10,
  },
  projectItem: {
    marginBottom: 10,
  },
  projectName: {
    fontSize: 12,
    fontWeight: "bold",
  },
  projectUrl: {
    fontSize: 10,
    color: "#2563eb",
  },
  projectRole: {
    fontSize: 11,
    fontStyle: "italic",
  },
  technologies: {
    fontSize: 10,
    color: "#666666",
  },
});
