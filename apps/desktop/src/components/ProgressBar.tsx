interface ProgressBarProps {
  current: number;
  total: number;
  isConverting: boolean;
}

export function ProgressBar({ current, total, isConverting }: ProgressBarProps) {
  if (!isConverting && current === 0) {
    return null;
  }

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="progress-container">
      <div className="progress-text">
        {isConverting ? (
          <>Converting: {current} of {total} files ({percentage}%)</>
        ) : (
          <>Completed: {current} of {total} files</>
        )}
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
