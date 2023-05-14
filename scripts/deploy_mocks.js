const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockERC20 = await MockERC20.deploy();

    const MockOneSplit = await ethers.getContractFactory("MockOneSplit");
    const mockOneSplit = await MockOneSplit.deploy();

    console.log("Mock ERC20 deployed to:", mockERC20.address);
    console.log("Mock OneSplit deployed to:", mockOneSplit.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
