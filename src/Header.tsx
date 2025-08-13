import { Link } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';

export const Header = () => {
  // Hook to open the Web3Modal
  const { open } = useWeb3Modal();
  // Hook to get account connection status and address
  const { address, isConnected } = useAccount();

  return (
    <header className="p-4 bg-white dark:bg-dark-surface shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-primary">Habify</Link>
          <Link to="/friends" className="text-gray-600 dark:text-gray-300 hover:text-primary">Friends</Link>
        </div>
        
        {/* Our new, custom connect button */}
        <button 
          onClick={() => open()} 
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 font-semibold"
        >
          {isConnected 
            ? `${address?.substring(0, 6)}...${address?.substring(address.length - 4)}` 
            : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
};