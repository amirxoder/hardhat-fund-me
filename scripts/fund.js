const { getNamedAccounts, ethers } = require("hardhat");

const main = async () => {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("Funding Contract is Deploying...");
  const tranactionResponse = await fundMe.fund({
    value: ethers.utils.parseEther("0.1"),
  });
  await tranactionResponse.wait(1);
  console.log("Funded!");
  const balance = await ethers.provider.getBalance(fundMe.address);
  console.log(Number(balance.toString()) / 1e18);
};

main()
  .then(() => process.exit())
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
