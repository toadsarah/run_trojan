
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { ADDRESS, ABI, ERC20, ERC20ABI } from '../contract/index';

// Define the type for the context state
interface GlobalContextType {
  walletAddress: string;
  contract: ethers.Contract | null;
  provider: ethers.providers.Web3Provider | null;
  erc20Contract: ethers.Contract | null;
}

// Create the context with a default value
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalContextProviderProps {
  children: ReactNode;
}

export const GlobalContextProvider = ({ children }: GlobalContextProviderProps) => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [erc20Contract, setErc20Contract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  //* Set the wallet address to the state
  const updateCurrentWalletAddress = async () => {
    const accounts = await window?.ethereum?.request({ method: 'eth_requestAccounts' });
    if (accounts) setWalletAddress(accounts[0]);
  };

  useEffect(() => {
    updateCurrentWalletAddress();

    window?.ethereum?.on('accountsChanged', updateCurrentWalletAddress);

    // Cleanup event listener on unmount
    return () => {
      window?.ethereum?.removeListener('accountsChanged', updateCurrentWalletAddress);
    };
  }, []);

  //* Set the smart contract and provider to the state
  useEffect(() => {
    const setSmartContractAndProvider = async () => {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const newProvider = new ethers.providers.Web3Provider(connection);
      const signer = newProvider.getSigner();
      const newContract = new ethers.Contract(ADDRESS, ABI, signer);
      const newErc20Contract = new ethers.Contract(ERC20, ERC20ABI, signer);

      setProvider(newProvider);

      setContract(newContract);
      setErc20Contract(newErc20Contract);
    };

    setSmartContractAndProvider();
  }, [walletAddress]);

  return (
    <GlobalContext.Provider
      value={{
        walletAddress,
        contract,
        provider,
        erc20Contract,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalContextProvider');
  }
  return context;
};
