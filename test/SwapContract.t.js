const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SwapContract", function () {
  let SwapContract, swapContract, owner, addr1, addr2, oneSplit, token;
  
  beforeEach(async function () {

    SwapContract = await ethers.getContractFactory("SwapContract");
    [owner, addr1, addr2] = await ethers.getSigners();

    oneSplit = await deployMockOneSplit();
    token = await deployMockERC20();

    swapContract = await SwapContract.deploy(oneSplit.address);
  });

  describe("depositERC20()", function () {
    it("Should deposit ERC20 tokens and record the deposit", async function () {

      await token.connect(addr1).approve(swapContract.address, 100);
      
      await swapContract.connect(addr1).depositERC20(token.address, 100, addr2.address);

      expect(await swapContract.deposits(addr1.address)).to.equal(100);
      expect(await swapContract.balances(addr1.address, token.address)).to.equal(100);
      expect((await swapContract.followers(addr1.address))[0]).to.equal(addr2.address);
    });
  });

  describe("withdrawERC20()", function () {
    it("Should withdraw ERC20 tokens and update the balance", async function () {

      await token.connect(addr1).approve(swapContract.address, 100);
      await swapContract.connect(addr1).depositERC20(token.address, 100, addr2.address);

      await swapContract.connect(addr1).withdrawERC20(token.address, 50);

      expect(await swapContract.balances(addr1.address, token.address)).to.equal(50);
      expect(await swapContract.deposits(addr1.address)).to.equal(50);
    });
  });
});
