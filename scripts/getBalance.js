const { ethers, getNamedAccounts } = require("hardhat");

async function checkContractBalance() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  const contractBalance = await fundMe.getContractBalance();
  console.log(`Contract balance: ${contractBalance.toString()} wei`);
}

checkContractBalance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
