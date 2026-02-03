import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '@mantine/hooks';

export type DateFormat = 'de' | 'uk' | 'us' | 'unix' | 'ISO 8601';

type PreferencesCtx = {
  dateFormat: DateFormat;
  setDateFormat: (v: DateFormat) => void;
};

const PreferencesContext = createContext<PreferencesCtx | null>(null);

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dateFormat, setDateFormat] = useLocalStorage<DateFormat>({
    key: 'date_format',
    defaultValue: 'ISO 8601',
  });

  return (
    <PreferencesContext.Provider value={{ dateFormat, setDateFormat }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx)
    throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
