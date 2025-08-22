require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    const VOTER_ADDRESSES = [
        process.env.VOTER_ADDRESS_ONE,
        process.env.VOTER_ADDRESS_TWO,
        process.env.VOTER_ADDRESS_THIRD,
        process.env.VOTER_ADDRESS_FOURTH,
        process.env.VOTER_ADDRESS_FIFTH
    ];

    const CANDIDATE_NAMES = [
        "Lucas",
        "Philippe",
        "Iles",
        "Ahkbar",
        "Japhet",
        "Salman",
        "Yanis",
        "Mateo",
        "Gregoire",
        "Arthur"
    ];

    if (!CONTRACT_ADDRESS) throw new Error("CONTRACT_ADDRESS not found in environment variables");
    if (!ethers.isAddress(CONTRACT_ADDRESS)) throw new Error("Adresse de contrat invalide");

    VOTER_ADDRESSES.forEach((address, index) => {
        if (!ethers.isAddress(address)) throw new Error(`Adresse votant invalide à l'index ${index}`);
    });

    const [owner] = await ethers.getSigners(); 
    const votingContract = await ethers.getContractAt("Voting", CONTRACT_ADDRESS, owner);

    console.log("Owner:", owner.address);
    console.log("Seeding on:", CONTRACT_ADDRESS);

    console.log("Adding candidates...");
    for (const name of CANDIDATE_NAMES) {
        await (await votingContract.addCandidate(name)).wait();
        console.log(`Added candidate: ${name}`);
    }

    console.log("Adding voters...");
    for (const voterAddress of VOTER_ADDRESSES) {
        await (await votingContract.addVoter(voterAddress)).wait();
        console.log(`Added voter: ${voterAddress}`);
    }

    console.log("\n=== Candidates ===");
    for (let i = 0; i < CANDIDATE_NAMES.length; i++) {
        const candidate = await votingContract.getCandidate(i);
        console.log(`c${i}:`, candidate);
    }

    console.log("\n=== Voters ===");
    for (const voterAddress of VOTER_ADDRESSES) {
        const voter = await votingContract.getVoter(voterAddress);
        console.log(`voter (${voterAddress}):`, voter);
    }
}

main().catch((e) => { 
    console.error(e); 
    process.exit(1); 
});