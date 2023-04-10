const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ASWER,
} = require("../hepler-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ASWER],
    });
    log("Mocks Deployed!");
    log("________________________________________________");
  }
};

module.exports.tags = ["all", "mocks"];
