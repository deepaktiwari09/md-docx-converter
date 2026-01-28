import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { ConversionToggle } from './components/ConversionToggle';
import { FileDropZone } from './components/FileDropZone';
import { FileList } from './components/FileList';
import { ProgressBar } from './components/ProgressBar';
import { ResultsList } from './components/ResultsList';
import { useConversion } from './hooks/useConversion';
import './App.css';

function App() {
  const [toDocx, setToDocx] = useState(true);
  const [files, setFiles] = useState<string[]>([]);
  const [outputDir, setOutputDir] = useState<string>('');

  const { isConverting, progress, results, error, convertBatch, reset } =
    useConversion();

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
      // Scan folder for matching files
      const ext = toDocx ? 'md' : 'docx';
      try {
        const foundFiles = await invoke<string[]>('scan_directory', {
          dirPath: selected,
          extension: ext,
        });
        if (foundFiles.length > 0) {
          setFiles((prev) => [...prev, ...foundFiles]);
          // Also set as output dir if not already set
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
    reset();
  }, [reset]);

  const handleConvert = useCallback(async () => {
    if (files.length === 0 || !outputDir) return;

    try {
      await convertBatch(files, outputDir, toDocx);
    } catch (e) {
      console.error('Conversion failed:', e);
    }
  }, [files, outputDir, toDocx, convertBatch]);

  const handleModeChange = useCallback(
    (newToDocx: boolean) => {
      setToDocx(newToDocx);
      setFiles([]);
      reset();
    },
    [reset]
  );

  const canConvert = files.length > 0 && outputDir && !isConverting;

  return (
    <div className="app">
      <header className="app-header">
        <h1>MD ↔ DOCX Converter</h1>
      </header>

      <main className="app-main">
        <ConversionToggle
          toDocx={toDocx}
          onChange={handleModeChange}
          disabled={isConverting}
        />

        <FileDropZone
          onFilesSelected={(paths) => setFiles((prev) => [...prev, ...paths])}
          onSelectFiles={handleSelectFiles}
          onSelectFolder={handleSelectFolder}
          disabled={isConverting}
          acceptedExtension={extension}
        />

        <FileList
          files={files}
          onRemove={handleRemoveFile}
          onClear={handleClearFiles}
          disabled={isConverting}
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
            <button
              onClick={handleSelectOutputDir}
              disabled={isConverting}
            >
              Browse
            </button>
          </div>
        </div>

        <ProgressBar
          current={progress.current}
          total={progress.total}
          isConverting={isConverting}
        />

        {error && <div className="error-message">{error}</div>}

        <ResultsList results={results} />

        <div className="action-section">
          <button
            className="convert-btn"
            onClick={handleConvert}
            disabled={!canConvert}
          >
            {isConverting ? 'Converting...' : `Convert ${files.length} File(s)`}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
