import { Typography, Alert } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import styles from "./Docs.module.css";

export function DocsChapterContent({ chapter }) {
  return (
    <article>
      {/* Quick Reference Grid */}
      {chapter.quickReference && (
        <div className={styles.quickRefGrid}>
          {chapter.quickReference.map((ref, idx) => (
            <div key={idx} className={styles.refItem}>
              <span className={styles.refLabel}>{ref.label}</span>
              <span className={styles.refValue}>{ref.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Web Impact Card */}
      {chapter.webImpact && (
        <div className={styles.webImpactCard}>
          <LanguageIcon sx={{ color: "#2563EB", mt: 0.3 }} />
          <div>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1E40AF" }}>
              Public Website Sync Impact
            </Typography>
            <Typography variant="body2" className={styles.webImpactText}>
              {chapter.webImpact}
            </Typography>
          </div>
        </div>
      )}

      {/* Chapter Sections */}
      {chapter.sections &&
        chapter.sections.map((section, idx) => (
          <section key={idx} className={styles.section}>
            <Typography variant="h2" className={styles.sectionHeading}>
              {section.heading}
            </Typography>

            <Typography variant="body1" className={styles.sectionContent}>
              {section.content}
            </Typography>

            {/* Step-by-step procedures */}
            {section.steps && section.steps.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: "#0F172A",
                    mb: 1,
                    textTransform: "uppercase",
                    fontSize: "0.78rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  Step-by-Step Procedure
                </Typography>
                <div className={styles.stepsList}>
                  {section.steps.map((step, sIdx) => {
                    const cleanStep = step.replace(/^[0-9]+\.\s*/, "");
                    return (
                      <div key={sIdx} className={styles.stepItem}>
                        <span className={styles.stepNumber}>{sIdx + 1}</span>
                        <span>{cleanStep}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form Fields & Configuration Schema Table */}
            {section.fieldsTable && section.fieldsTable.length > 0 && (
              <div className={styles.fieldsSectionWrapper}>
                <Typography
                  variant="subtitle2"
                  className={styles.fieldsSectionTitle}
                >
                  Form Fields & Content Controls Reference
                </Typography>

                {/* Desktop & Tablet Table */}
                <div className={styles.tableResponsiveWrapper}>
                  <table className={styles.fieldsTable}>
                    <thead>
                      <tr>
                        <th style={{ width: "24%" }}>Field Name & Type</th>
                        <th style={{ width: "12%" }}>Required</th>
                        <th style={{ width: "34%" }}>Description & Business Purpose</th>
                        <th style={{ width: "30%" }}>Format & Best Practice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.fieldsTable.map((f, fIdx) => (
                        <tr key={fIdx}>
                          <td>
                            <span className={styles.fieldName}>{f.name}</span>
                            <span className={styles.fieldTypeTag}>{f.type}</span>
                          </td>
                          <td>
                            <span
                              className={
                                f.required ? styles.requiredBadge : styles.optionalBadge
                              }
                            >
                              {f.required ? "Required" : "Optional"}
                            </span>
                          </td>
                          <td>
                            <div className={styles.fieldDesc}>{f.description}</div>
                            {f.webImpact && (
                              <div className={styles.fieldWebImpact}>
                                <strong>Web Impact:</strong> {f.webImpact}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className={styles.fieldFormat}>
                              {f.format || f.bestPractice}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List (< 768px) */}
                <div className={styles.fieldsMobileList}>
                  {section.fieldsTable.map((f, fIdx) => (
                    <div key={fIdx} className={styles.fieldMobileCard}>
                      <div className={styles.fieldMobileHeader}>
                        <div>
                          <span className={styles.fieldName}>{f.name}</span>
                          <span className={styles.fieldTypeTag}>{f.type}</span>
                        </div>
                        <span
                          className={
                            f.required ? styles.requiredBadge : styles.optionalBadge
                          }
                        >
                          {f.required ? "Required" : "Optional"}
                        </span>
                      </div>
                      <div className={styles.fieldDesc}>{f.description}</div>
                      {f.webImpact && (
                        <div className={styles.fieldWebImpact}>
                          <strong>Web Impact:</strong> {f.webImpact}
                        </div>
                      )}
                      <div className={styles.fieldMobileRule}>
                        <span className={styles.fieldMobileRuleLabel}>Format / Rule:</span>
                        <span>{f.format || f.bestPractice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alert / Callout */}
            {section.alert && (
              <Alert
                severity={section.alert.type === "important" ? "warning" : "info"}
                className={styles.alertCard}
                sx={{
                  border:
                    section.alert.type === "important"
                      ? "1px solid #FED7AA"
                      : "1px solid #BAE6FD",
                  background:
                    section.alert.type === "important" ? "#FFF7ED" : "#F0F9FF",
                }}
              >
                {section.alert.text}
              </Alert>
            )}

            {/* Checklists */}
            {section.checklist && (
              <div className={styles.checklistCard}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "#166534", mb: 1.5, fontSize: "0.85rem" }}
                >
                  Verification Checklist
                </Typography>
                {section.checklist.map((item, cIdx) => (
                  <div key={cIdx} className={styles.checklistItem}>
                    <CheckCircleOutlineIcon fontSize="small" sx={{ color: "#16A34A" }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
    </article>
  );
}
