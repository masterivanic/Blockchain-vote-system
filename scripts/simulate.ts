import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

function parseCandidates(): string[] {
  const dd = process.argv.indexOf("--");
  const args = dd >= 0 ? process.argv.slice(dd + 1) : [];
  if (args.length > 0) {
    return args;
  }
  const env = process.env.CANDIDATES;
  if (env && env.trim().length > 0) {
    return env.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return ["Alice", "Bob", "Charlie"];
}

async function main() {
  const candidates = parseCandidates();

  const [deployer, ...others] = await ethers.getSigners();
  const voters = others.slice(0, Math.min(10, others.length));

  const Voting = await ethers.getContractFactory("Voting");
  const contract = await Voting.connect(deployer).deploy(candidates, true);
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`Contrat déployé: ${address}`);
  console.log(`Vote ouvert: ${(await contract.isOpen())}`);

  // Chaque électeur vote de manière déterministe (round-robin)
  for (let i = 0; i < voters.length; i++) {
    const voter = voters[i];
    const choice = i % candidates.length;
    const tx = await contract.connect(voter).vote(choice);
    await tx.wait();
    console.log(`Voter ${await voter.getAddress()} a voté pour '${candidates[choice]}' (index ${choice})`);
  }

  // Fermer le vote
  const closeTx = await contract.connect(deployer).closeVoting();
  await closeTx.wait();
  console.log("Vote fermé.");

  // Récupérer les résultats
  const resultsBN = await contract.getResults();
  const results = resultsBN.map((x: any) => Number(x));
  const total = results.reduce((a: number, b: number) => a + b, 0);

  console.log("\nRésultats:");
  for (let i = 0; i < candidates.length; i++) {
    console.log(`- ${candidates[i]}: ${results[i]} vote(s)`);
  }
  console.log(`Total des votes: ${total}`);

  // Sauvegarder dans results/
  const outDir = path.join("results");
  fs.mkdirSync(outDir, { recursive: true });
  const basename = `${new Date().toISOString().replace(/[:.]/g, "-")}-results.json`;
  const outPath = path.join(outDir, basename);
  const summary = {
    network: network.name,
    contract: address,
    candidates,
    results,
    totalVotes: total,
    closedAt: new Date().toISOString(),
  };
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), { encoding: "utf-8" });
  console.log(`\nFichier de résultats: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


