import Link from 'next/link';
import { useDisconnect } from 'wagmi';
import { FaSignOutAlt } from 'react-icons/fa';

interface TokenDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TokenDrawer({ isOpen, onClose }: TokenDrawerProps) {
  const { disconnect } = useDisconnect();
  const ethBalance = "1.234 ETH";
  const datBalance = "1000 DAT";

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  return (
    <>
      <div className={`fixed inset-y-0 right-0 w-80 bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 
        rounded-l-2xl border-l border-gray-700 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Token Balance</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4 flex-grow">
            <div className="bg-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">ETH Balance</span>
                <span className="text-white font-bold">{ethBalance}</span>
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">DAT Balance</span>
                <span className="text-white font-bold">{datBalance}</span>
              </div>
            </div>

            <Link 
              href="/swap" 
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200"
              onClick={onClose}
            >
              Swap Tokens
            </Link>
          </div>

          <button
            onClick={handleDisconnect}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-400/50 transition-colors"
          >
            <FaSignOutAlt />
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      {/* 遮罩层 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
    </>
  );
} 