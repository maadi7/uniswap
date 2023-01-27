import React, { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import Web3Modal from "web3modal";
//import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";

//INTERNAL IMPORT
import {
  checkIfWalletConnected,
  connectWallet,
  connectingWithBooToken,
  connectingWithLIfeToken,
  connectingWithSingleSwapToken,
  connectingWithIWTHToken,
  connectingWithDAIToken,
  connectingWithUserStorageContract,
} from "../Utils/appFeatures";
import { getPrice } from "../Utils/fetchingPrice";
import { swapUpdatePrice } from "../Utils/swapUpdatePrice";
import { getLiquidityData } from "../Utils/checkLiquidity";
import { connectingWithPoolContract } from "../Utils/deployPool";
import { addLiquidityExternal } from "../Utils/addLiquidity";

import { IWETHABI } from "./constants";
import ERC20 from "./ERC20.json";

export const SwapTokenContext = React.createContext();

export const SwapTokenContextProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [ether, setEther] = useState("");
  const [networkConnect, setNetworkConnect] = useState("");
  const [weth9, setWeth9] = useState("");
  const [dai, setDai] = useState("");
  const [tokenData, setTokenData] = useState([]);
  const [getAllLiquidity, setGetAllLiquidity] = useState([]);
  const addToken = [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
    "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    "0xe044814c9eD1e6442Af956a817c161192cBaE98F",
    "0xaB837301d12cDc4b97f1E910FC56C9179894d9cf",
    "0x4ff1f64683785E0460c24A4EF78D582C2488704f",
  ];

  //Fetch data
  const fetchingData = async () => {
    try {
      const userAccount = await checkIfWalletConnected();
      setAccount(userAccount);
      console.log(userAccount);
      const web3modal = new Web3Modal();
      const connection = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      //console.log(provider);
      const balance = await provider.getBalance(userAccount);
      const convertBal = BigNumber.from(balance).toString();
      const ethValue = ethers.utils.formatEther(convertBal);
      setEther(ethValue);

      const network = await provider.getNetwork();
      setNetworkConnect(network.name);

      addToken.map(async (el, i) => {
        const contract = new ethers.Contract(el, ERC20, provider);
        const userBalance = await contract.balanceOf(userAccount);
        const tokenLeft = BigNumber.from(userBalance).toString();
        const convertTokenBal = ethers.utils.formatEther(tokenLeft);

        //get name and symbol
        const symbol = await contract.symbol();
        const name = await contract.name();

        tokenData.push({
          name: name,
          symbol: symbol,
          tokenBalance: convertTokenBal,
          tokenAddress: el,
        });
      });
      //console.log(tokenData);
      const userStorageData = await connectingWithUserStorageContract();
      const userLiqudity = await userStorageData.getAllTransactions();
      console.log(userLiqudity);

      //CHECK LIQUIDITY

      userLiqudity.map(async (el, i) => {
        const poolAddress = el.poolAddress;
        const liqdidityData = await getLiquidityData(
          el.poolAddress,
          el.tokenAddress0,
          el.tokenAddress1
        );
        getAllLiquidity.push(liqdidityData);
        console.log(getAllLiquidity);
      });

      //WETH balance
      // const wethContract = await connectingWithIWTHToken();
      // const wethBal = await wethContract.balanceOf(userAccount);
      // const wethToken = BigNumber.from(wethBal).toString();
      // const convertwethTokenBal = ethers.utils.formatEther(wethToken);
      // setWeth9(convertwethTokenBal);

      // //DAI balance
      // const daiContract = await connectingWithDAIToken();

      // const daiBal = await daiContract.balanceOf(userAccount);
      // //console.log(daiBal);
      // const daiToken = BigNumber.from(daiBal).toString();
      // const convertdaiTokenBal = ethers.utils.formatEther(daiToken);
      // setDai(convertdaiTokenBal);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchingData();
  }, []);

  //CREATE LIQUDITY AND POOL
  const createLiquidityAndPool = async ({
    tokenAddress0,
    tokenAddress1,
    fee,
    tokenPrice1,
    tokenPrice2,
    slippage,
    deadline,
    tokenAmountOne,
    tokenAmountTwo,
  }) => {
    try {
      //CREaTE POOL
      const createPool = await connectingWithPoolContract(
        tokenAddress0,
        tokenAddress1,
        fee,
        tokenPrice1,
        tokenPrice2,
        {
          gasLimit: 500000,
        }
      );

      const poolAddress = createPool;

      const info = await addLiquidityExternal(
        tokenAddress0,
        tokenAddress1,
        poolAddress,
        fee,
        tokenAmountOne,
        tokenAmountTwo
      );
      const userStorageData = await connectingWithUserStorage();
      const userLiqudity = await userStorageData.addToBlockchain(
        poolAddress,
        tokenAddress0,
        tokenAddress1
      );
      userLiqudity.wait();
    } catch (error) {
      console.log(error);
    }
  };

  //Single Swap Token
  const singleSwapToken = async ({ token1, token2, swapAmount }) => {
    console.log(
      token1.tokenAddress.tokenAddress,
      token2.tokenAddress.tokenAddress,
      swapAmount
    );
    try {
      let singleSwapToken;
      let weth;
      let dai;

      singleSwapToken = await connectingWithSingleSwapToken();
      weth = await connectingWithIWTHToken();
      dai = await connectingWithDAIToken();
      //console.log(singleSwapToken.address);

      const decimals = 18;
      const inputAmount = swapAmount;
      const amountIn = ethers.utils.parseUnits(
        inputAmount.toString(),
        decimals
      );

      console.log(amountIn);
      await weth.deposit({ value: amountIn });
      await weth.approve(singleSwapToken.address, amountIn);

      //SWAP
      const transaction = await singleSwapToken.swapExactInputSingle(
        token1.tokenAddress.tokenAddress,
        token2.tokenAddress.tokenAddress,
        amountIn,
        {
          gasLimit: 300000,
        }
      );
      await transaction.wait();
      console.log(transaction);
      const balance = await dai.balanceOf(account);
      const transferAmount = BigNumber.from(balance).toString();
      const ethValue = ethers.utils.formatEther(transferAmount);
      setDai(ethValue);
      console.log("DAI balance: " + ethValue);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SwapTokenContext.Provider
      value={{
        singleSwapToken,
        account,
        weth9,
        dai,
        networkConnect,
        getPrice,
        swapUpdatePrice,
        ether,
        connectWallet,
        tokenData,
        setGetAllLiquidity,
        getAllLiquidity,
        createLiquidityAndPool,
      }}
    >
      {children}
    </SwapTokenContext.Provider>
  );
};
