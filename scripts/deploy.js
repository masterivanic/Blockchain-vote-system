const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();          
    await voting.waitForDeployment();               

    const addr = await voting.getAddress();         
    console.log("Voting contract deployed to:", addr);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});