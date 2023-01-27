wethAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
factoryAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
swapRouterAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
nftDescriptorAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
positionDescriptorAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
positionManagerAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

shoaibAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
rayyanAddrss = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
popUpAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

const { Contract, BigNumber } = require("ethers");
const bn = require("bignumber.js");
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

const MAINNET_URL =
  "https://eth-mainnet.g.alchemy.com/v2/IsrEbDIdJExiYfNnO6XLgJrZIRghxc5H";

const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);

function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
}
const nonfungiblePositionManager = new Contract(
  positionManagerAddress,
  artifacts.NonfungiblePositionManager.abi,
  provider
);

const factory = new Contract(
  factoryAddress,
  artifacts.UniswapV3Factory.abi,
  provider
);

async function deployPool(token0, token1, fee, price) {
  const [owner] = await ethers.getSigners();
  await nonfungiblePositionManager
    .connect(owner)
    .createAndInitializePoolIfNecessary(token0, token1, fee, price, {
      gasLimit: 5000000,
    });
  const poolAddress = await factory.connect(owner).getPool(token0, token1, fee);
  return poolAddress;
}
// npx hardhat run --network goerli scripts/deployPool.js

async function main() {
  const shoRay = await deployPool(
    shoaibAddress,
    rayyanAddrss,
    500,
    encodePriceSqrt(1, 1)
  );
  console.log("SHO_RAY", `${shoRay}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
