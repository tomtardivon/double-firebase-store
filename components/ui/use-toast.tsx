'use client';

import { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastState {
  toasts: Toast[];
}

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(action: { type: 'ADD_TOAST' | 'REMOVE_TOAST'; toast?: Toast; id?: string }) {
  switch (action.type) {
    case 'ADD_TOAST':
      memoryState = {
        toasts: [...memoryState.toasts, action.toast!],
      };
      break;
    case 'REMOVE_TOAST':
      memoryState = {
        toasts: memoryState.toasts.filter((t) => t.id !== action.id),
      };
      break;
  }
  
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

export function useToast() {
  const [state, setState] = useState<ToastState>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    toasts: state.toasts,
    toast: (toast: Omit<Toast, 'id'>) => {
      const id = Date.now().toString();
      const newToast = { ...toast, id };
      dispatch({ type: 'ADD_TOAST', toast: newToast });
      
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id });
      }, 5000);
    },
    dismiss: (id: string) => {
      dispatch({ type: 'REMOVE_TOAST', id });
    },
  };
}