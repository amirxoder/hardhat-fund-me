const { assert, expect } = require("chai");
const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../hepler-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe, deployer, mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", () => {
        it("sets the aggregator address correctly", async () => {
          const response = await fundMe.s_priceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", () => {
        it("Fails if you dont send enough ETH", async () => {
          await expect(fundMe.fund()).to.be.reverted;
        });
        it("update the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.s_addressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });
        it("Add funders to array of funders", async () => {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.s_funders(0);
          assert.equal(response, deployer);
        });
      });

      describe("withdraw", () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue });
        });

        it("withdraw ETH from a single funder", async () => {
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCosts = gasUsed.mul(effectiveGasPrice);
          console.log(gasCosts.toString() / 1e18);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString(),
            endingDeployerBalance.add(gasCosts).toString()
          );
        });

        it("allows withdraw with multiple funders", async () => {
          const accoutns = await ethers.getSigners();
          for (let i = 1; i <= 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accoutns[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          console.log(
            `Starting fund me balance after call fund(): ${
              Number(startingFundMeBalance.toString()) / 1e18
            }`
          );

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          console.log(
            `Starting Deployer before call withdraw() : ${Math.round(
              Number(startingDeployerBalance.toString()) / 1e18
            )}`
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCosts = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          console.log(
            `FundMe Balance after call withdraw(): ${endingFundMeBalance.toString()}`
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          console.log(
            `Deployer balance after call withdraw() : ${Math.round(
              endingDeployerBalance.add(gasCosts).toString() / 1e18
            )}`
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCosts).toString()
          );

          // Make sure that the funders are reset properly:
          await expect(fundMe.s_funders(0)).to.be.reverted;
          for (let i = 1; i > 6; i++) {
            assert(fundMe.s_addressToAmountFunded(accoutns[i].address), 0);
          }
        });

        it("Only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(attackerConnectedContract.withdraw()).to.be.reverted;
        });

        // cheaper withdraw
        it("allows cheaperWithdraw with multiple funders", async () => {
          const accoutns = await ethers.getSigners();
          for (let i = 1; i <= 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accoutns[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          console.log(
            `Starting fund me balance after call fund(): ${
              Number(startingFundMeBalance.toString()) / 1e18
            }`
          );

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          console.log(
            `Starting Deployer before call withdraw() : ${Math.round(
              Number(startingDeployerBalance.toString()) / 1e18
            )}`
          );

          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCosts = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          console.log(
            `FundMe Balance after call withdraw(): ${endingFundMeBalance.toString()}`
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          console.log(
            `Deployer balance after call withdraw() : ${Math.round(
              endingDeployerBalance.add(gasCosts).toString() / 1e18
            )}`
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCosts).toString()
          );

          // Make sure that the funders are reset properly:
          await expect(fundMe.s_funders(0)).to.be.reverted;
          for (let i = 1; i > 6; i++) {
            assert(fundMe.s_addressToAmountFunded(accoutns[i].address), 0);
          }
        });
      });
    });
