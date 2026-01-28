import type { ConversionResult } from '../hooks/useConversion';

interface ResultsListProps {
  results: ConversionResult[];
}

export function ResultsList({ results }: ResultsListProps) {
  if (results.length === 0) {
    return null;
  }

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.length - successCount;

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  return (
    <div className="results-list">
      <div className="results-header">
        <span className="success-count">{successCount} succeeded</span>
        {failCount > 0 && (
          <span className="fail-count">{failCount} failed</span>
        )}
      </div>
      <ul className="results-items">
        {results.map((result, index) => (
          <li
            key={index}
            className={`result-item ${result.success ? 'success' : 'error'}`}
          >
            <span className="result-icon">{result.success ? '✓' : '✗'}</span>
            <span className="result-file" title={result.input}>
              {getFileName(result.input)}
            </span>
            {result.error && (
              <span className="result-error" title={result.error}>
                {result.error}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
