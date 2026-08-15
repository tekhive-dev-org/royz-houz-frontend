import { APPLICATION_STEPS } from "@/constants/talentApplication";
import styles from "./TalentApplication.module.css";

/**
 * 5-Step visual progress bar for Talent Application wizard.
 */
export function ApplicationProgressBar({ currentStep, onStepClick }) {
  return (
    <div className={styles.progressContainer} aria-label="Application Progress">
      <div className={styles.progressStepsRow}>
        {APPLICATION_STEPS.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isActive = isCompleted || isCurrent;

          return (
            <div
              key={step.id}
              className={`${styles.progressStepCol} ${
                isCompleted ? styles.progressStepClickable : ""
              }`}
              onClick={() => {
                if (isCompleted && onStepClick) {
                  onStepClick(step.id);
                }
              }}
            >
              {/* Step Label */}
              <span
                className={`${styles.stepLabel} ${
                  isCurrent
                    ? styles.stepLabelCurrent
                    : isCompleted
                    ? styles.stepLabelCompleted
                    : styles.stepLabelInactive
                }`}
              >
                {step.label}
              </span>

              {/* Progress Line Indicator */}
              <div
                className={`${styles.stepIndicator} ${
                  isActive ? styles.stepIndicatorActive : styles.stepIndicatorInactive
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ApplicationProgressBar;
