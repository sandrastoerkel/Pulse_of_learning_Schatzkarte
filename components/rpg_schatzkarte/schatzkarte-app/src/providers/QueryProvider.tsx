import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Daten gelten 2 Minuten als "frisch" (kein Refetch)
      staleTime: 2 * 60 * 1000,
      // Cache bleibt 5 Minuten bestehen nach Unmount
      gcTime: 5 * 60 * 1000,
      // Kein automatischer Refetch beim Fensterfokus
      // (sonst flackert die UI bei jedem Tab-Wechsel)
      refetchOnWindowFocus: false,
      // Bei Fehler 1x retry, dann aufgeben
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
