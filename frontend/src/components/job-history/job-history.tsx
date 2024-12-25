import classes from "./job-history.module.css";
import { cleanUnderscoreStrings } from "@/libs/utils";

interface JobHistoryProps {
  open: boolean;
  output?: {
    history?: Array<{
      id: string;
      model_output: {
        action: Array<Record<string, any>>;
      };
      state: {
        screenshot?: string;
      };
    }>;
  };
}

export const JobHistory = ({ output, open }: JobHistoryProps) => {
  const history = output?.history;

  if (!open) {
    return null;
  }

  return (
    <div className={classes.jobHistoryContainer}>
      {history?.length > 0 ? (
        history.map((step) => (
          <div key={step.id} className={classes.jobHistoryStep}>
            {Array.isArray(step.model_output.action) &&
            step.model_output.action.length > 0 ? (
              step.model_output.action.map((actionItem, index) =>
                Object.entries(actionItem).map(([key, value]) => (
                  <div key={`${index}-${key}`} className={classes.actionItem}>
                    <div key={`${index}-${key}-inner`}>
                      <strong>Action - {cleanUnderscoreStrings(key)}:</strong>
                      {Object.entries(value).map(([innerKey, innerValue]) => (
                        <div key={`${index}-${key}-${innerKey}`}>
                          <span className={classes.actionItemKey}>
                            {cleanUnderscoreStrings(innerKey)}:
                          </span>
                          <span className={classes.actionItemValue}>
                            {innerValue}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )
            ) : (
              <span className={classes.noAction}>No action available</span>
            )}

            {/* Render screenshot if available */}
            {step.state.screenshot && (
              <img
                className={classes.jobHistoryScreenshot}
                src={`data:image/png;base64,${step.state.screenshot}`}
                alt="Step screenshot"
              />
            )}
          </div>
        ))
      ) : (
        <div>No job history available</div>
      )}
    </div>
  );
};
