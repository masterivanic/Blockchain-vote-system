import { ethers, artifacts, network } from "hardhat";
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
  console.log("Candidats:", candidates);

  const Voting = await ethers.getContractFactory("Voting");
  const contract = await Voting.deploy(candidates, true);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const net = await ethers.provider.getNetwork();
  const chainId = Number(net.chainId);
  const networkName = network.name;

  const artifact = await artifacts.readArtifact("Voting");

  const outDir = path.join("deployments", networkName === "unknown" ? "local" : networkName);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "Voting.json");

  const data = {
    address,
    chainId,
    networkName,
    abi: artifact.abi,
    candidates,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), { encoding: "utf-8" });

  console.log(`Contrat déployé à l'adresse: ${address}`);
  console.log(`Artefact: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


