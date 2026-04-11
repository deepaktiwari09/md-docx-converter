import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { ConversionToggle } from './components/ConversionToggle';
import { FileDropZone } from './components/FileDropZone';
import { FileList } from './components/FileList';
import { QueueStatus } from './components/QueueStatus';
import { HistorySidebar } from './components/HistorySidebar';
import { useQueue } from './hooks/useQueue';
import { useHistory } from './hooks/useHistory';
import './App.css';

function App() {
  const [toDocx, setToDocx] = useState(true);
  const [files, setFiles] = useState<string[]>([]);
  const [outputDir, setOutputDir] = useState<string>('');

  const history = useHistory();

  const queue = useQueue({
    onItemComplete: (item) => {
      history.addEntry(item);
    },
  });

  const extension = toDocx ? '.md' : '.docx';
  const filterName = toDocx ? 'Markdown' : 'Word Document';
  const filterExt = toDocx ? ['md', 'markdown'] : ['docx'];

  const handleSelectFiles = useCallback(async () => {
    const selected = await open({
      multiple: true,
      filters: [{ name: filterName, extensions: filterExt }],
    });

    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      setFiles((prev) => [...prev, ...paths]);
    }
  }, [filterName, filterExt]);

  const handleSelectFolder = useCallback(async () => {
    const selected = await open({
      directory: true,
    });

    if (selected && typeof selected === 'string') {
      const ext = toDocx ? 'md' : 'docx';
      try {
        const foundFiles = await invoke<string[]>('scan_directory', {
          dirPath: selected,
          extension: ext,
        });
        if (foundFiles.length > 0) {
          setFiles((prev) => [...prev, ...foundFiles]);
          if (!outputDir) {
            setOutputDir(selected);
          }
        }
      } catch (e) {
        console.error('Failed to scan directory:', e);
      }
    }
  }, [toDocx, outputDir]);

  const handleSelectOutputDir = useCallback(async () => {
    const selected = await open({
      directory: true,
    });

    if (selected && typeof selected === 'string') {
      setOutputDir(selected);
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const handleAddToQueue = useCallback(() => {
    if (files.length === 0 || !outputDir) return;
    queue.addToQueue(files, outputDir, toDocx);
    setFiles([]);
  }, [files, outputDir, toDocx, queue]);

  const handleModeChange = useCallback((newToDocx: boolean) => {
    setToDocx(newToDocx);
    setFiles([]);
  }, []);

  const canAdd = files.length > 0 && !!outputDir;

  return (
    <div className="app">
      <header className="app-header">
        <h1>MD ↔ DOCX Converter</h1>
      </header>

      <div className="app-body">
        <main className="app-main">
          <ConversionToggle
            toDocx={toDocx}
            onChange={handleModeChange}
            disabled={false}
          />

          <FileDropZone
            onFilesSelected={(paths) => setFiles((prev) => [...prev, ...paths])}
            onSelectFiles={handleSelectFiles}
            onSelectFolder={handleSelectFolder}
            disabled={false}
            acceptedExtension={extension}
          />

          <FileList
            files={files}
            onRemove={handleRemoveFile}
            onClear={handleClearFiles}
            disabled={false}
          />

          <div className="output-section">
            <label className="output-label">Output Directory:</label>
            <div className="output-row">
              <input
                type="text"
                className="output-input"
                value={outputDir}
                readOnly
                placeholder="Select output directory..."
              />
              <button onClick={handleSelectOutputDir}>Browse</button>
            </div>
          </div>

          <QueueStatus
            items={queue.items}
            onRemove={queue.removeItem}
            onClearCompleted={queue.clearCompleted}
          />

          <div className="action-section">
            <button
              className="convert-btn"
              onClick={handleAddToQueue}
              disabled={!canAdd}
            >
              {files.length > 0
                ? `Add ${files.length} File(s) to Queue`
                : 'Select Files to Convert'}
            </button>
          </div>
        </main>

        <HistorySidebar
          entries={history.entries}
          isLoading={history.isLoading}
          onOpen={history.openFile}
          onDelete={history.deleteOutputFile}
          onRemoveEntry={history.removeEntry}
        />
      </div>
    </div>
  );
}

export default App;
