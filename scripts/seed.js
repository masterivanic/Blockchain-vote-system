// scripts/seed.js
const { ethers } = require("hardhat");

async function main() {
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <-- remplace
    const [owner] = await ethers.getSigners();
    const V = await ethers.getContractAt("Voting", CONTRACT_ADDRESS, owner);

    console.log("Owner:", owner.address);
    console.log("Seeding candidates on", CONTRACT_ADDRESS);

    let tx = await V.addCandidate("Alice"); await tx.wait();
    tx = await V.addCandidate("Bob"); await tx.wait();

    const c0 = await V.getCandidate(0);
    const c1 = await V.getCandidate(1);
    console.log("Candidats:", c0, c1);
}

main().catch((e) => { console.error(e); process.exit(1); });
