const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    await voting.deployed();
  });

  it("Should add a voter", async function () {
    await voting.addVoter(addr1.address);
    const voter = await voting.getVoter(addr1.address);
    expect(voter.isAllowed).to.equal(true);
  });

  it("Should add a candidate", async function () {
    await voting.addCandidate("Candidate 1");
    const candidate = await voting.getCandidate(0);
    expect(candidate.name).to.equal("Candidate 1");
  });

  it("Should cast a vote", async function () {
    await voting.addVoter(addr1.address);
    await voting.addCandidate("Candidate 1");
    await voting.connect(addr1).vote(0);
    const candidate = await voting.getCandidate(0);
    expect(candidate.voteCount).to.equal(1);
  });
});