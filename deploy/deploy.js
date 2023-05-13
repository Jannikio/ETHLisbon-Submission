const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const OneSplitAddress = "0x11111112542D85B3EF69AE05771c2dCCff4fAa26";

    const SwapContract = await hre.ethers.getContractFactory("SwapContract");
    const swapContract = await SwapContract.deploy(OneSplitAddress);

    await swapContract.deployed();

    console.log("SwapContract deployed to:", swapContract.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
