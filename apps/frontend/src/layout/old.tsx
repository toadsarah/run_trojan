import React from 'react';
import Sidebar from '@/components/sidebar';
import { useState, useEffect } from "react"
import { useSyncProviders } from "../hooks/useSyncProviders"
import { formatAddress } from "../utils"

export const Layout = ({ children }: { children: React.ReactNode }) => {

  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [userAccount, setUserAccount] = useState<string>("")
  const providers = useSyncProviders()

  // Connect to the selected provider using eth_requestAccounts.
  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      const accounts = await providerWithInfo.provider.request({
        method: "eth_requestAccounts"
      })

      setSelectedWallet(providerWithInfo)
      setUserAccount(accounts?.[0])
    } catch (error) {
      console.error(error)
    }
  }






  return (

    <div className="flex border-collapse">
      <>
        <div className='flex flex-col items-center justify-center bg-green-500 hidden'>
          <h2>{userAccount ? "" : "No "}Wallet Selected</h2>
          {userAccount &&
            <div>
              <div>
                <img src={selectedWallet.info.icon} alt={selectedWallet.info.name} />
                <div>{selectedWallet.info.name}</div>
                <div>({formatAddress(userAccount)})</div>
              </div>
            </div>
          }

        </div>

      </>
      {userAccount ? (
        <>
          <Sidebar />
          <main className="flex-1 pt-[2rem] pb-1 mx-auto max-w-[1100px]">
            {children}
          </main>
        </>
      ) : (
        <>
          <div className='flex flex-col items-center justify-center bg-green-500 h-full'>
            <h2>Wallets Detected:</h2>
            <div>
              {
                providers.length > 0 ? providers?.map((provider: EIP6963ProviderDetail) => (
                  <button key={provider.info.uuid} onClick={() => handleConnect(provider)} >
                    <img src={provider.info.icon} alt={provider.info.name} />
                    <div>{provider.info.name}</div>
                  </button>
                )) :
                  <div>
                    No Announced Wallet Providers
                  </div>
              }
            </div>
          </div>
        </>
      )}

    </div>
  );
};
