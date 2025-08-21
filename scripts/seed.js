const { ethers } = require("hardhat");

async function main() {
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // adresse du contrat
    const VOTER_ADDRESS = "0x2069147d7E792537cF561F72418De17c9181aEe0"; // <- remplace par ton adresse MetaMask

    if (!ethers.isAddress(CONTRACT_ADDRESS)) throw new Error("Adresse de contrat invalide");
    if (!ethers.isAddress(VOTER_ADDRESS)) throw new Error("Adresse votant invalide");

    const [owner] = await ethers.getSigners(); // le déployeur = owner
    const V = await ethers.getContractAt("Voting", CONTRACT_ADDRESS, owner);

    console.log("Owner:", owner.address);
    console.log("Seeding on:", CONTRACT_ADDRESS);

    await (await V.addCandidate("Alice")).wait();
    await (await V.addCandidate("Bob")).wait();
    await (await V.addVoter(VOTER_ADDRESS)).wait();

    console.log("c0:", await V.getCandidate(0));
    console.log("c1:", await V.getCandidate(1));
    console.log("voter:", await V.getVoter(VOTER_ADDRESS));
}

main().catch((e) => { console.error(e); process.exit(1); });