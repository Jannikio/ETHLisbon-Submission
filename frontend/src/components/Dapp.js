import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Contract artifacts and address

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { ActivityTable } from "./ActivityTable";

// TODO: 
const NETWORK_ID = '80001'; //testnet 
// const NETWORK_ID = '137';
const ALCHEMY_KEY_MUMBAI= "XfU2gmaFvWo_0B-BK8shsBO5CdsApKNH";
const SwapABI = require("../contract/swapContractABI.json");
const ERC20ABI = require("../contract/ERC20ABI.json");

/** SWITCH the version */
 const swapContractAddr = "0xBdA3BA9e21f8A41B0F163132A85cE10daf8D5d9e"; // Polygon new testnet
/ const swapContractAddr = "0xA4E3e5B9f9b9BEcA5019afFaE9f89095091F790F"; // POlygon final mainnet

// WETH
const depositTokenAddr = "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa" // WETH ERC20 on testnet

function Dapp(){
    /** Initialize React states */
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState(Number(0));
    const [networkError, setNetWorkError] = useState('');
    const [degenAddress, setDegenAddress] = useState('');
    const [depositAmount, setDepositAmount] = useState(Number(0));
    const [page, setPage] = useState(Number(0));

    /** Metamask internal functions */
    const _initialize = (address) => {
        setAddress(address);
      }

    const _switchChain = async () => {
        const chainIdHex = `0x${NETWORK_ID.toString(16)}`
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
        await _initialize(address);
      }

    const _checkNetwork = ()  => {
        if (window.ethereum.networkVersion !== NETWORK_ID) {
            _switchChain();
        }
    }

    const _dismissNetworkError = () => {
        setNetWorkError(undefined);
    }

    const _connectWallet = async()  => {
        const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        _checkNetwork();
        _initialize(selectedAddress);

        window.ethereum.on("accountsChanged", ([newAddress]) => {
            _initialize(newAddress);
        });
    };

    const _getContract = async(_contractAddress, _ABI) => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        console.log("signer is:", signer);
        const contract = new ethers.Contract(_contractAddress, _ABI, signer);
        console.log("init contract:", contract);
        return contract;
    }

    /** Call DegenMove contract */
    const approveETH = async() => {
        let ERC20contract;
        if(!ERC20contract) {
            ERC20contract = await _getContract(depositTokenAddr, ERC20ABI);
            console.log("check ERC20contract:", ERC20contract);            
        };
        const depositAmountBigInt = ethers.parseUnits(depositAmount);
        // increaseAllowance 
        // const getApproveTx = await ERC20contract.approve(swapContractAddr, depositAmountBigInt);
        const getApproveTx = await ERC20contract.increaseAllowance(swapContractAddr, depositAmountBigInt);
        const _receipt = await getApproveTx.wait();
        return 0;
    }

    const depositETH = async() => {
        let swapContract;
        if(!swapContract) {
            swapContract = await _getContract(swapContractAddr, SwapABI);
            console.log("check contract:", swapContract);            
        };
        const follower = degenAddress;
        console.log("depositAmount:", depositAmount);
        const depositAmountBigInt = ethers.parseUnits(depositAmount);
        console.log("swapContract:", swapContract);
        console.log("depositTokenAddr:", depositTokenAddr);
        const depositTx = await swapContract.depositERC20(depositTokenAddr, depositAmountBigInt, follower);
        const _receipt = await depositTx.wait();
        // setPage(Number(1));
    }


    if (window.ethereum === undefined) {
        return <NoWalletDetected />;
    }

    if (!address) {
    return (
        <ConnectWallet 
        connectWallet={() => _connectWallet()} 
        networkError={networkError}
        dismiss={() => _dismissNetworkError()}
        />
    );
    }
  
      // If the token data or the user's balance hasn't loaded yet, we show
      // a loading component.
      if (balance > 0) {
        return <Loading />;
      }

    // Tracking page.
    if(page == 1){
        return (
        <div>
            <h1>
            Your assets are being traded automatically!
            </h1>
            <ActivityTable userAddress={address} />
        </div>
        );
    }

      // 1st page
      return (
        <div>
          <div className="row">
            <div className="col-12">
              <h1>
                Welcome <b>{address}</b>!!
              </h1>
              <>
                <p>You start following this Degen’s activity.</p>
                <input type="text" onChange={e => setDegenAddress(e.target.value)} />
              </>
            </div>
            <>
                <p>
                    Let’s deposit your assets to start following this Degen’s activity.
                </p>
                <input type="number" onChange={e => setDepositAmount(e.target.value)} /> ETH.
            </>
            <hr />
            <>
                <button onClick={approveETH}>Approve your assert to deposit!</button>
            </>
            <hr />
            <>
                <button onClick={depositETH}>Deposit your assert into the DegenMove!</button>   
            </>
          </div>
          <hr />
        </div>
      );
}

export default Dapp;