const { run } = require("hardhat");

const verify = async (contractAddress, args) => {
  console.log("Verifying the contract");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includs("already verify")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
};

module.exports = { verify };
