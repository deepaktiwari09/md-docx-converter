import { invoke } from '@tauri-apps/api/core';
import type { QueueItem } from '../types';

interface QueueStatusProps {
  items: QueueItem[];
  onRemove: (id: string) => void;
  onClearCompleted: () => void;
}

export function QueueStatus({ items, onRemove, onClearCompleted }: QueueStatusProps) {
  if (items.length === 0) return null;

  const doneCount = items.filter((i) => i.status === 'done').length;
  const errorCount = items.filter((i) => i.status === 'error').length;
  const total = items.length;
  const completedCount = doneCount + errorCount;
  const hasCompleted = completedCount > 0;

  const getFileName = (path: string) => {
    const parts = path.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1] || path;
  };

  const handleOpen = (path: string) => {
    invoke('open_file', { path }).catch(console.error);
  };

  const statusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return <span className="queue-icon pending">...</span>;
      case 'converting':
        return <span className="queue-icon converting"><span className="spinner" /></span>;
      case 'done':
        return <span className="queue-icon done">✓</span>;
      case 'error':
        return <span className="queue-icon error">✗</span>;
    }
  };

  return (
    <div className="queue-status">
      <div className="queue-header">
        <span className="queue-progress">
          {completedCount < total
            ? `Converting ${completedCount + 1} of ${total}`
            : `${doneCount} succeeded${errorCount > 0 ? `, ${errorCount} failed` : ''}`}
        </span>
        {hasCompleted && (
          <button className="queue-clear-btn" onClick={onClearCompleted}>
            Clear
          </button>
        )}
      </div>
      <ul className="queue-items">
        {[...items].reverse().map((item) => (
          <li key={item.id} className={`queue-item queue-item-${item.status}`}>
            {statusIcon(item.status)}
            <span className="queue-filename" title={item.inputPath}>
              {getFileName(item.inputPath)}
            </span>
            {item.status === 'done' && (
              <button className="open-btn" onClick={() => handleOpen(item.outputPath)}>
                Open
              </button>
            )}
            {(item.status === 'done' || item.status === 'error') && (
              <button className="queue-dismiss-btn" onClick={() => onRemove(item.id)}>
                ×
              </button>
            )}
            {item.status === 'error' && item.error && (
              <span className="queue-error" title={item.error}>
                {item.error}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
