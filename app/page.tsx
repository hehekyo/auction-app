'use client';

export default function Home() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold mb-6">Welcome to DAuction</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        A decentralized auction platform supporting ETH and DAT token trading
      </p>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-white" >Token Swap</h2>
          <p className="text-gray-400 mb-4">Quick and easy exchange between ETH and DAT</p>
          <a
            href="/swap"
            className="inline-block bg-blue-600 text-white px-6 py-2 mt-5 rounded-lg hover:bg-blue-700 transition"
          >
            Start Swapping
          </a>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">NFT Auctions</h2>
          <p className="text-gray-400 mb-4">Participate in NFT auctions and discover unique digital artworks</p>
          <a
            href="/auctions"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Browse Auctions
          </a>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mt-12 mb-8 max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold mb-2">About DAT Token</h3>
        <p className="text-gray-600 dark:text-gray-300">
          DAT (DAuction Token) is the token issued by our platform. It can be exchanged for ETH, 
          and its price is dynamically adjusted using a price oracle.
        </p>
      </div>
    </div>
  );
}