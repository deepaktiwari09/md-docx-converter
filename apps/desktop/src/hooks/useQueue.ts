import { useReducer, useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { QueueItem, QueueItemStatus, ConversionResult } from '../types';

// --- Reducer ---

type QueueAction =
  | { type: 'ADD_ITEMS'; items: QueueItem[] }
  | { type: 'SET_STATUS'; id: string; status: QueueItemStatus; result?: ConversionResult; error?: string }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'CLEAR_COMPLETED' };

function queueReducer(state: QueueItem[], action: QueueAction): QueueItem[] {
  switch (action.type) {
    case 'ADD_ITEMS':
      return [...state, ...action.items];
    case 'SET_STATUS':
      return state.map((item) =>
        item.id === action.id
          ? { ...item, status: action.status, result: action.result ?? item.result, error: action.error ?? item.error }
          : item
      );
    case 'REMOVE_ITEM':
      return state.filter((item) => item.id !== action.id);
    case 'CLEAR_COMPLETED':
      return state.filter((item) => item.status !== 'done' && item.status !== 'error');
    default:
      return state;
  }
}

// --- Hook ---

interface UseQueueOptions {
  onItemComplete?: (item: QueueItem) => void;
}

let nextId = 0;

export function useQueue(options?: UseQueueOptions) {
  const [items, dispatch] = useReducer(queueReducer, []);
  const processingRef = useRef(false);
  const onCompleteRef = useRef(options?.onItemComplete);
  onCompleteRef.current = options?.onItemComplete;

  const getFileName = (path: string) => {
    const parts = path.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1] || path;
  };

  const addToQueue = useCallback(
    (files: string[], outputDir: string, toDocx: boolean) => {
      const newItems: QueueItem[] = files.map((filePath) => {
        const fileName = getFileName(filePath);
        const stem = fileName.replace(/\.[^.]+$/, '');
        const ext = toDocx ? 'docx' : 'md';
        const outputPath = `${outputDir}/${stem}.${ext}`;

        return {
          id: `q-${Date.now()}-${nextId++}`,
          inputPath: filePath,
          outputPath,
          toDocx,
          status: 'pending' as QueueItemStatus,
          result: null,
          error: null,
        };
      });

      dispatch({ type: 'ADD_ITEMS', items: newItems });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', id });
  }, []);

  const clearCompleted = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPLETED' });
  }, []);

  // Processing loop
  useEffect(() => {
    if (processingRef.current) return;

    const pendingItem = items.find((i) => i.status === 'pending');
    if (!pendingItem) return;

    processingRef.current = true;

    dispatch({ type: 'SET_STATUS', id: pendingItem.id, status: 'converting' });

    const command = pendingItem.toDocx ? 'convert_md_to_docx' : 'convert_docx_to_md';

    invoke<ConversionResult>(command, {
      inputPath: pendingItem.inputPath,
      outputPath: pendingItem.outputPath,
    })
      .then((result) => {
        const status: QueueItemStatus = result.success ? 'done' : 'error';
        dispatch({
          type: 'SET_STATUS',
          id: pendingItem.id,
          status,
          result,
          error: result.error ?? undefined,
        });

        const completedItem: QueueItem = {
          ...pendingItem,
          status,
          result,
          error: result.error,
        };
        onCompleteRef.current?.(completedItem);
      })
      .catch((err) => {
        const errorMsg = err instanceof Error ? err.message : String(err);
        dispatch({
          type: 'SET_STATUS',
          id: pendingItem.id,
          status: 'error',
          error: errorMsg,
        });

        const completedItem: QueueItem = {
          ...pendingItem,
          status: 'error',
          error: errorMsg,
        };
        onCompleteRef.current?.(completedItem);
      })
      .finally(() => {
        processingRef.current = false;
      });
  }, [items]);

  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const convertingItem = items.find((i) => i.status === 'converting');
  const doneCount = items.filter((i) => i.status === 'done').length;
  const errorCount = items.filter((i) => i.status === 'error').length;

  return {
    items,
    addToQueue,
    removeItem,
    clearCompleted,
    pendingCount,
    convertingItem,
    doneCount,
    errorCount,
    isProcessing: processingRef.current || !!convertingItem,
  };
}
