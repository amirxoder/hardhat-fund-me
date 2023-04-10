const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../hepler-hardhat-config");
const { assert } = require("chai");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", () => {
      let fundMe, deployer;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("Allow people to fund and widthraw", async () => {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await ethers.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), 0);
      });
    });
