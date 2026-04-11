import { useState } from 'react';
import type { HistoryEntry } from '../types';

interface HistorySidebarProps {
  entries: HistoryEntry[];
  isLoading: boolean;
  onOpen: (path: string) => void;
  onDelete: (id: string, path: string) => void;
  onRemoveEntry: (id: string) => void;
}

function relativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function HistorySidebar({
  entries,
  isLoading,
  onOpen,
  onDelete,
  onRemoveEntry,
}: HistorySidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HistoryEntry | null>(null);

  return (
    <aside className={`history-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? 'Show history' : 'Hide history'}
        >
          {collapsed ? '◀' : '▶'}
        </button>
        <h2>History</h2>
        <span className="sidebar-count">{entries.length}</span>
      </div>

      <div className="sidebar-content">
        {isLoading && <p className="sidebar-loading">Loading...</p>}

        {!isLoading && entries.length === 0 && (
          <div className="sidebar-empty">
            <p>No conversion history</p>
            <p className="sidebar-empty-hint">Converted files will appear here</p>
          </div>
        )}

        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`history-entry ${entry.success ? '' : 'history-entry-failed'}`}
          >
            <div className="history-entry-top">
              <span className={`history-badge ${entry.direction === 'md_to_docx' ? 'badge-docx' : 'badge-md'}`}>
                {entry.direction === 'md_to_docx' ? 'DOCX' : 'MD'}
              </span>
              <span className="history-time">{relativeTime(entry.timestamp)}</span>
            </div>
            <div className="history-entry-files">
              <span className="history-input" title={entry.input_path}>
                {entry.input_filename}
              </span>
              <span className="history-arrow">→</span>
              <span className="history-output" title={entry.output_path}>
                {entry.output_filename}
              </span>
            </div>
            {!entry.success && entry.error && (
              <span className="history-error" title={entry.error}>
                {entry.error}
              </span>
            )}
            <div className="history-actions">
              {entry.success && (
                <button
                  className="history-open-btn"
                  onClick={() => onOpen(entry.output_path)}
                >
                  Open
                </button>
              )}
              <button
                className="history-delete-btn"
                onClick={() => setDeleteTarget(entry)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {deleteTarget && (
        <div className="delete-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="delete-warning">Delete this conversion?</p>
            <p className="delete-path">{deleteTarget.output_filename}</p>
            <div className="delete-actions">
              <button
                className="delete-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Keep History
              </button>
              <button
                className="delete-cancel"
                onClick={() => {
                  onRemoveEntry(deleteTarget.id);
                  setDeleteTarget(null);
                }}
              >
                Remove Entry
              </button>
              {deleteTarget.success && (
                <button
                  className="delete-confirm"
                  onClick={() => {
                    onDelete(deleteTarget.id, deleteTarget.output_path);
                    setDeleteTarget(null);
                  }}
                >
                  Delete File
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
