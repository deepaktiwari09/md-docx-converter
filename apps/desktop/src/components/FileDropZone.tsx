import { useCallback, useState, DragEvent } from 'react';

interface FileDropZoneProps {
  onFilesSelected: (files: string[]) => void;
  onSelectFiles: () => void;
  onSelectFolder: () => void;
  disabled?: boolean;
  acceptedExtension: string;
}

export function FileDropZone({
  onFilesSelected,
  onSelectFiles,
  onSelectFolder,
  disabled,
  acceptedExtension,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const items = e.dataTransfer.items;
      const paths: string[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && file.name.endsWith(acceptedExtension)) {
            // Note: In Tauri, we'd use the file path from drag event
            // For now, we'll rely on the file picker
            paths.push(file.name);
          }
        }
      }

      if (paths.length > 0) {
        onFilesSelected(paths);
      }
    },
    [disabled, acceptedExtension, onFilesSelected]
  );

  return (
    <div
      className={`drop-zone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="drop-zone-content">
        <p className="drop-zone-text">
          Drop {acceptedExtension.toUpperCase()} files here
        </p>
        <p className="drop-zone-or">or</p>
        <div className="drop-zone-buttons">
          <button onClick={onSelectFiles} disabled={disabled}>
            Select Files
          </button>
          <button onClick={onSelectFolder} disabled={disabled}>
            Select Folder
          </button>
        </div>
      </div>
    </div>
  );
}
