import './App.css'
import { useState, useEffect } from 'react'
import { formatBalance, formatChainAsNum } from './utils'
import detectEthereumProvider from '@metamask/detect-provider'
import Web3 from "web3";

const App = () => {
  const [, setHasProvider] = useState<boolean | null>(null)
  const initialState = { accounts: [], balance: "", chainId: "" }
  const [wallet, setWallet] = useState(initialState)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [contract, setContract] = useState<any>(null);
  const [lotteryName, setLotteryName] = useState("");

  const contractABI: any = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "endLottery",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "lotteries",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "startDate",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "ended",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "prizePool",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "participate",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "startDate",
          "type": "uint256"
        }
      ],
      "name": "startLottery",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawCommission",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
  const contractAddress = "0xE090BCe55606138AB1cd703edFC59F3Fe72524c2";

  useEffect(() => {
    const refreshAccounts = (accounts: any) => {
      if (accounts.length > 0) {
        updateWallet(accounts)
      } else {
        // if length 0, user is disconnected
        setWallet(initialState)
      }
    }

    const refreshChain = (chainId: any) => {
      setWallet((wallet) => ({ ...wallet, chainId }))
    }

    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true })
      setHasProvider(Boolean(provider))

      if (provider) {
        const accounts = await window.ethereum.request(
          { method: 'eth_accounts' }
        )
        refreshAccounts(accounts)
        window.ethereum.on('accountsChanged', refreshAccounts)
        window.ethereum.on("chainChanged", refreshChain)
      }
    }

    getProvider()

    const web3 = new Web3(window.ethereum);
    const lotteryContract = new web3.eth.Contract(contractABI, contractAddress);
    setContract(lotteryContract);

    return () => {
      window.ethereum?.removeListener('accountsChanged', refreshAccounts)
      window.ethereum?.removeListener("chainChanged", refreshChain)
    }
  }, [])

  const updateWallet = async (accounts: any) => {
    const balance = formatBalance(await window.ethereum!.request({
      method: "eth_getBalance",
      params: [accounts[0], "latest"],
    }))
    const chainId = await window.ethereum!.request({
      method: "eth_chainId",
    })
    setWallet({ accounts, balance, chainId })
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    await window.ethereum.request({
      method: "eth_requestAccounts",
    })
      .then((accounts: []) => {
        setError(false)
        updateWallet(accounts)
      })
      .catch((err: any) => {
        setError(true)
        setErrorMessage(err.message)
      })
    setIsConnecting(false)
  }

  const disableConnect = Boolean(wallet) && isConnecting


  const buyTicket = async () => {
    if (contract) {
      await contract.methods.participate(lotteryName).send({ from: wallet.accounts[0], value: Web3.utils.toWei("0.0001", "ether") });
    }
  };

  const finalizeLottery = async () => {
    if (contract) {
      await contract.methods.endLottery(lotteryName).send({ from: wallet.accounts[0] });
    }
  };

  const withdrawCommission = async () => {
    if (contract) {
      await contract.methods.withdrawCommission().send({ from: wallet.accounts[0] });
    }
  };

  const startLottery = async () => {
    if (contract) {
      await contract.methods.startLottery(lotteryName, Date.now()).send({ from: wallet.accounts[0] });
    }
  };

  return (
    <div className="App">
      {window.ethereum?.isMetaMask && wallet.accounts.length < 1 &&

        <button disabled={disableConnect} onClick={handleConnect}>Connect MetaMask</button>
      }

      {wallet.accounts.length > 0 &&
        <>
          <div>Wallet Accounts: {wallet.accounts[0]}</div>
          <div>Wallet Balance: {wallet.balance}</div>
          <div>Hex ChainId: {wallet.chainId}</div>
          <div>Numeric ChainId: {formatChainAsNum(wallet.chainId)}</div>
        </>
      }
      <div>
        <input type="text" value={lotteryName} onChange={(e) => setLotteryName(e.target.value)} />
        <button onClick={startLottery}>New lottery</button>
        <br></br>
        <button onClick={buyTicket}>Buy Ticket</button>
        <button onClick={finalizeLottery}>Finalize Lottery</button>
        <button onClick={withdrawCommission}>Withdraw Commission</button>
      </div>
      {error && (
        <div onClick={() => setError(false)}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )
      }
    </div>
  )
}

export default App