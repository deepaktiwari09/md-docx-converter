import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { ConversionResult } from '../hooks/useConversion';

interface ResultsListProps {
  results: ConversionResult[];
}

export function ResultsList({ results }: ResultsListProps) {
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; path: string } | null>(null);
  const [deleted, setDeleted] = useState<Set<number>>(new Set());

  if (results.length === 0) {
    return null;
  }

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.length - successCount;

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  const handleOpen = (path: string) => {
    invoke('open_file', { path }).catch(console.error);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await invoke('delete_file', { path: deleteTarget.path });
      setDeleted((prev) => new Set(prev).add(deleteTarget.index));
    } catch (e) {
      console.error('Delete failed:', e);
    }
    setDeleteTarget(null);
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
            className={`result-item ${result.success ? 'success' : 'error'} ${deleted.has(index) ? 'deleted' : ''}`}
          >
            <span className="result-icon">
              {deleted.has(index) ? '−' : result.success ? '✓' : '✗'}
            </span>
            <span className="result-file" title={result.input}>
              {getFileName(result.input)}
            </span>
            {result.success && !deleted.has(index) && (
              <>
                <button
                  className="open-btn"
                  onClick={() => handleOpen(result.output)}
                  title={result.output}
                >
                  Open
                </button>
                <button
                  className="delete-btn"
                  onClick={() => setDeleteTarget({ index, path: result.output })}
                  title="Delete output file"
                >
                  Delete
                </button>
              </>
            )}
            {deleted.has(index) && (
              <span className="deleted-label">Deleted</span>
            )}
            {result.error && (
              <span className="result-error" title={result.error}>
                {result.error}
              </span>
            )}
          </li>
        ))}
      </ul>

      {deleteTarget && (
        <div className="delete-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="delete-warning">Are you sure you want to delete this file?</p>
            <p className="delete-path">{getFileName(deleteTarget.path)}</p>
            <p className="delete-note">This will permanently remove the file from the output location.</p>
            <div className="delete-actions">
              <button className="delete-cancel" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="delete-confirm" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
