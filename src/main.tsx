import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set');
}

const metadata = {
  name: 'Habify',
  description: 'Build habits with crypto incentives',
  url: 'https://habify.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [base, baseSepolia] as const;
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata
});

createWeb3Modal({ wagmiConfig, projectId });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);