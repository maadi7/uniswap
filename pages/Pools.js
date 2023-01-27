import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import images from "../assets";
import Style from "../styles/Pools.module.css";
import { PoolAdd, PoolConnect } from "../Components/index";
import { SwapTokenContext } from "../Context/SwapContext";

const Pools = () => {
  const { account, createLiquidityAndPool, tokenData, getAllLiquidity } =
    useContext(SwapTokenContext);
  const [closePool, setClosePool] = useState(false);

  return (
    <div className={Style.Pool}>
      {/* {!account ? <PoolAdd account={account} /> : <PoolConnect />} */}
      {closePool ? (
        <PoolAdd
          account={account}
          setClosePool={setClosePool}
          tokenData={tokenData}
          createLiquidityAndPool={createLiquidityAndPool}
        />
      ) : (
        <PoolConnect
          setClosePool={setClosePool}
          getAllLiquidity={getAllLiquidity}
        />
      )}
    </div>
  );
};

export default Pools;
