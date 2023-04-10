const { getNamedAccounts, ethers } = require("hardhat");
const main = async () => {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe");
  console.log("Withdrawing...");
  const tranactionResponse = await fundMe.withdraw();
  await tranactionResponse.wait(1);
  console.log("Got it back");
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
