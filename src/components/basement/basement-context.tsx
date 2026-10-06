import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type BasementContextValue = {
  /** The cat climbed out of the basement: she sleeps on the floor strip and leaves claw marks on LinkedIn. */
  catUp: boolean;
  setCatUp: (v: boolean) => void;
};

const BasementContext = createContext<BasementContextValue | null>(null);

export const BasementProvider = ({ children }: { children: ReactNode }) => {
  const [catUp, setCatUp] = useState(false);
  const value = useMemo(() => ({ catUp, setCatUp }), [catUp]);
  return <BasementContext.Provider value={value}>{children}</BasementContext.Provider>;
};

export const useBasement = (): BasementContextValue => {
  const ctx = useContext(BasementContext);
  if (!ctx) throw new Error('useBasement must be used inside <BasementProvider>');
  return ctx;
};
