const { ethers, getNamedAccounts, network } = require("hardhat");

async function main() {
    const { deployer, newOwner } = await getNamedAccounts(); // Specifying the network explicitly to access accounts
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log(`Got contract FundMe at ${fundMe.address}`);

    console.log(`Transferring ownership to ${newOwner}...`);
    const transactionResponse = await fundMe
        .connect(ethers.provider.getSigner(deployer)) // Use the deployer account to connect
        .transferOwnership(newOwner); // Transfer ownership to the newOwner account
    await transactionResponse.wait();
    console.log("Ownership transferred!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
