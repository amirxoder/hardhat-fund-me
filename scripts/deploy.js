const { ethers } = require("hardhat");

const main = async () => {
  console.log(`Deploying the Contract...`);
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  const fundMe = await fundMeFactory.deploy();
  console.log(`Deploy contract to ${fundMe.address}`);
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
