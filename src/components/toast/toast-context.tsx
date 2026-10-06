import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { TOASTS, type ToastKind } from '../../data/toasts';

export type ToastVars = Record<string, string>;

type ToastState = {
  open: boolean;
  kind: ToastKind;
  index: number;
  vars: ToastVars;
};

type ToastApi = {
  showToast: (kind: ToastKind, vars?: ToastVars) => void;
};

type ToastViewState = ToastState & { close: () => void };

const VISIBLE_MS = 7000;

const ToastApiContext = createContext<ToastApi | null>(null);
const ToastStateContext = createContext<ToastViewState | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ToastState>({ open: false, kind: 'exp', index: 0, vars: {} });
  const timer = useRef<number | undefined>(undefined);

  const close = useCallback(() => {
    clearTimeout(timer.current);
    setState((s) => ({ ...s, open: false }));
  }, []);

  const showToast = useCallback((kind: ToastKind, vars: ToastVars = {}) => {
    setState({ open: true, kind, vars, index: Math.floor(Math.random() * TOASTS[kind].length) });
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState((s) => ({ ...s, open: false })), VISIBLE_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const api = useMemo(() => ({ showToast }), [showToast]);
  const view = useMemo(() => ({ ...state, close }), [state, close]);

  return (
    <ToastApiContext.Provider value={api}>
      <ToastStateContext.Provider value={view}>{children}</ToastStateContext.Provider>
    </ToastApiContext.Provider>
  );
};

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastApiContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

export const useToastState = (): ToastViewState => {
  const ctx = useContext(ToastStateContext);
  if (!ctx) throw new Error('useToastState must be used inside <ToastProvider>');
  return ctx;
};
