import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { HistoryEntry, QueueItem } from '../types';

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    invoke<HistoryEntry[]>('load_history')
      .then(setEntries)
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const addEntry = useCallback(async (item: QueueItem) => {
    const getFileName = (path: string) => {
      const parts = path.replace(/\\/g, '/').split('/');
      return parts[parts.length - 1] || path;
    };

    const entry: HistoryEntry = {
      id: '',
      input_path: item.inputPath,
      output_path: item.outputPath,
      direction: item.toDocx ? 'md_to_docx' : 'docx_to_md',
      success: item.result?.success ?? false,
      error: item.error,
      timestamp: new Date().toISOString(),
      input_filename: getFileName(item.inputPath),
      output_filename: getFileName(item.outputPath),
    };

    try {
      const saved = await invoke<HistoryEntry>('save_history_entry', { entry });
      setEntries((prev) => [saved, ...prev].slice(0, 1000));
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  }, []);

  const removeEntry = useCallback(async (id: string) => {
    try {
      await invoke('delete_history_entry', { id });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Failed to delete history entry:', err);
    }
  }, []);

  const openFile = useCallback(async (path: string) => {
    try {
      await invoke('open_file', { path });
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  }, []);

  const deleteOutputFile = useCallback(
    async (id: string, path: string) => {
      try {
        await invoke('delete_file', { path });
        await invoke('delete_history_entry', { id });
        setEntries((prev) => prev.filter((e) => e.id !== id));
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    },
    []
  );

  return {
    entries,
    isLoading,
    addEntry,
    removeEntry,
    openFile,
    deleteOutputFile,
  };
}
