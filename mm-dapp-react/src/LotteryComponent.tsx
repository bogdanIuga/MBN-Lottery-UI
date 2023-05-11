import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { toWei } from "web3-utils";

const LotteryComponent = () => {
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);

    // Connect application with Metamask
    useEffect(() => {
        const web3 = new Web3(window.ethereum);
        window.ethereum.enable().then((accounts: any) => {
            setAccount(accounts[0]);
        });

        // Your contract ABI and address
        const contractABI = [
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
        const contractAddress = "0xE090BCe55606138AB1cd703edFC59F3Fe72524c2"; // TODO: add your contract address

        const lotteryContract = new web3.eth.Contract(contractABI, contractAddress);
        setContract(lotteryContract);
        console.log(contract);
    }, []);

    // Function for users to join the lottery
    const buyTicket = async () => {
        if (contract) {
            await contract.methods.participate('Lottery1').send({ from: account, value: web3.utils.toWei(0.001, "ether") });
        }
    };

    // Function for the owner to finalize the lottery
    const finalizeLottery = async () => {
        if (contract) {
            await contract.methods.endLottery('Lottery1').send({ from: account });
        }
    };

    // Function for the owner to withdraw a commission
    const withdrawCommission = async () => {
        if (contract) {
            await contract.methods.withdrawCommission().send({ from: account });
        }
    };

    return (
        <div>
            <button onClick={buyTicket}>Buy Ticket</button>
            <button onClick={finalizeLottery}>Finalize Lottery</button>
            <button onClick={withdrawCommission}>Withdraw Commission</button>
        </div>
    );
};

export default LotteryComponent;
