// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();           // déploiement
    await voting.waitForDeployment();               // attendre le minage

    const addr = await voting.getAddress();         // <-- v6 : récupérer l'adresse
    console.log("Voting contract deployed to:", addr);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
