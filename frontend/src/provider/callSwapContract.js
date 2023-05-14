// node -v
// v16.18.0
const ethers = require('ethers');
const dotenv = require("dotenv")
dotenv.config()

// TODO: 
const NETWORK_ID = '137';
const SwapABI = require("../contract/swapContractABI.json");
// const ABI = require("contract/abi.json");
const ERC20ABI = require("../contract/ERC20ABI.json");
const ALCHEMY_KEY_MUMBAI= "XfU2gmaFvWo_0B-BK8shsBO5CdsApKNH";
const ALCHEMY_KEY_POLYGON= "p99hkQoDbHmjZylr4IZqyRLSZhPmbllx";
const swapContractAddr = "0xA4E3e5B9f9b9BEcA5019afFaE9f89095091F790F"; // Polygon Mainnet
const WETHAddr = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"; // WETH ERC20 on mainnet
const WMATICAddr = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
const BATAddr = "0x3Cef98bb43d732E2F285eE605a8158cDE967D219"; // BAT Token on the polygon mainnet

let signer;
const _getContract = async(_contractAddress, _ABI) => {
    const provider = new ethers.AlchemyProvider(
        "matic", 
        ALCHEMY_KEY_POLYGON
    );
    const wallet = new ethers.Wallet(process.env.secret_key, provider);
    const contract = new ethers.Contract(_contractAddress, _ABI, wallet);
    return contract;
}

const approveETH = async() => {
    ERC20contract = await _getContract(WETHAddr, ERC20ABI);
    const depositAmountBigInt = ethers.parseUnits(depositAmount);
    // increaseAllowance 
    // const getApproveTx = await ERC20contract.approve(swapContractAddr, depositAmountBigInt);
    const getApproveTx = await ERC20contract.increaseAllowance(swapContractAddr, depositAmountBigInt);
    const _receipt = await getApproveTx.wait();
    return 0;
}

const depositETH = async(contract) => {
    const follower = "0x00f419978a4c6D60d7Ea0F32e0dae491363baA04";
    const depositAmountBigInt = ethers.parseUnits(depositAmount);

    const provider = new ethers.AlchemyProvider(
        "matic", 
        ALCHEMY_KEY_POLYGON
    );
    const wallet = new ethers.Wallet(process.env.secret_key, provider);
    const depositTx = await contract.connect(wallet).depositERC20(WETHAddr, depositAmountBigInt, follower);
    const _receipt = await depositTx.wait();
}

const depositAmount = "1"; //test: owns 0.00001matic
const executeSwap = async(swapContract) => {
    const provider = new ethers.AlchemyProvider(
        "matic", 
        ALCHEMY_KEY_POLYGON
    );
    const depositAmountBigInt = ethers.parseUnits(depositAmount);
    console.log("depositAmountBigInt:", depositAmountBigInt);
    const wallet = new ethers.Wallet(process.env.secret_key, provider);
    console.log();
    const swapTx  = await swapContract.connect(wallet).executeSwap(
        WMATICAddr,
        BATAddr,
        depositAmountBigInt,
        10,
        0
    )
    const _receipt = await swapTx.wait();
    console.log(_receipt);

};

const prep = async() => {
    const swapContract = await _getContract(swapContractAddr, SwapABI);
    await approveETH(swapContract);
    await depositETH(swapContract);
};

const exec = async() => {
    const swapContract = await _getContract(swapContractAddr, SwapABI);
    await executeSwap(swapContract);
};

// prep();
exec();