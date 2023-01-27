wethAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
factoryAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
swapRouterAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
nftDescriptorAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
positionDescriptorAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
positionManagerAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

shoaibAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
rayyanAddrss = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
popUpAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
SHO_RAY = "0xf0eB49D6b40843936452c5Fa69192F92BE914515";

const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Shoaib: require("../artifacts/contracts/Shoaib.sol/Shoaib.json"),
  Rayyan: require("../artifacts/contracts/Rayyan.sol/Rayyan.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

const { Contract } = require("ethers");
const { Token } = require("@uniswap/sdk-core");
const { Pool, Position, nearestUsableTick } = require("@uniswap/v3-sdk");

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  console.log(tickSpacing, fee, liquidity, slot0);
  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
}

async function main() {
  const [owner, signer2] = await ethers.getSigners();
  const MAINNET_URL =
    "https://eth-mainnet.g.alchemy.com/v2/IsrEbDIdJExiYfNnO6XLgJrZIRghxc5H";

  const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);

  const ShoaibContract = new Contract(
    shoaibAddress,
    artifacts.Shoaib.abi,
    provider
  );
  const RayyanContract = new Contract(
    rayyanAddrss,
    artifacts.Rayyan.abi,
    provider
  );

  await ShoaibContract.connect(signer2).approve(
    positionManagerAddress,
    ethers.utils.parseEther("1000")
  );
  await RayyanContract.connect(signer2).approve(
    positionManagerAddress,
    ethers.utils.parseEther("1000")
  );

  const poolContract = new Contract(
    SHO_RAY,
    artifacts.UniswapV3Pool.abi,
    provider
  );

  const poolData = await getPoolData(poolContract);

  const ShoaibToken = new Token(31337, shoaibAddress, 18, "Shoaib", "SHO");
  const RayyanToken = new Token(31337, rayyanAddrss, 18, "Rayyan", "RAY");

  const pool = new Pool(
    ShoaibToken,
    RayyanToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  );

  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther("1"),
    tickLower:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) -
      poolData.tickSpacing * 2,
    tickUpper:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) +
      poolData.tickSpacing * 2,
  });
  console.log(position);
  const { amount0: amount0Desired, amount1: amount1Desired } =
    position.mintAmounts;

  params = {
    token0: shoaibAddress,
    token1: rayyanAddrss,
    fee: poolData.fee,
    tickLower:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) -
      poolData.tickSpacing * 2,
    tickUpper:
      nearestUsableTick(poolData.tick, poolData.tickSpacing) +
      poolData.tickSpacing * 2,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: signer2.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };

  const nonfungiblePositionManager = new Contract(
    positionManagerAddress,
    artifacts.NonfungiblePositionManager.abi,
    provider
  );

  const tx = await nonfungiblePositionManager
    .connect(signer2)
    .mint(params, { gasLimit: "1000000" });
  const receipt = await tx.wait();
  console.log(receipt);
}

/*
      npx hardhat run --network localhost scripts/addLiquidity.js
      */

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
