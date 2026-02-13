import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { EntitlementsProvider } from './entitlements/EntitlementsContext'
import { SectorProvider } from './solutions/SectorContext'
import './styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SectorProvider>
          <EntitlementsProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'bg-dashboard-card text-gray-100 border border-dashboard-border',
                duration: 4000,
              }}
            />
          </EntitlementsProvider>
        </SectorProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
