import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface ConversionResult {
  input: string;
  output: string;
  success: boolean;
  error: string | null;
}

export interface ConversionState {
  isConverting: boolean;
  progress: { current: number; total: number };
  results: ConversionResult[];
  error: string | null;
}

export function useConversion() {
  const [state, setState] = useState<ConversionState>({
    isConverting: false,
    progress: { current: 0, total: 0 },
    results: [],
    error: null,
  });

  const convertBatch = useCallback(
    async (files: string[], outputDir: string, toDocx: boolean) => {
      setState({
        isConverting: true,
        progress: { current: 0, total: files.length },
        results: [],
        error: null,
      });

      try {
        const results = await invoke<ConversionResult[]>('convert_batch', {
          files,
          outputDir,
          toDocx,
        });

        setState({
          isConverting: false,
          progress: { current: files.length, total: files.length },
          results,
          error: null,
        });

        return results;
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        setState((prev) => ({
          ...prev,
          isConverting: false,
          error,
        }));
        throw e;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isConverting: false,
      progress: { current: 0, total: 0 },
      results: [],
      error: null,
    });
  }, []);

  return {
    ...state,
    convertBatch,
    reset,
  };
}
