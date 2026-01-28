interface FileListProps {
  files: string[];
  onRemove: (index: number) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function FileList({ files, onRemove, onClear, disabled }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  return (
    <div className="file-list">
      <div className="file-list-header">
        <span>{files.length} file(s) selected</span>
        <button
          className="clear-btn"
          onClick={onClear}
          disabled={disabled}
        >
          Clear All
        </button>
      </div>
      <ul className="file-list-items">
        {files.map((file, index) => (
          <li key={index} className="file-item">
            <span className="file-name" title={file}>
              {getFileName(file)}
            </span>
            <button
              className="remove-btn"
              onClick={() => onRemove(index)}
              disabled={disabled}
              title="Remove"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
