import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configure React Query with sensible defaults for offline/healing behavior
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale-while-revalidate: show cached data then refresh
      staleTime: 1000 * 60, // 1 minute
      cacheTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Only retry network errors up to 3 times
        if (failureCount > 3) return false;
        // @ts-ignore
        const status = error?.status || (error?.response?.status);
        // Do not retry 4xx errors
        if (status && status >= 400 && status < 500) return false;
        return true;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff
    },
  },
});

export const ReactQueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default ReactQueryProvider;
