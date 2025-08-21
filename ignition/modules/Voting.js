const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VotingModule", (m) => {
  const voting = m.contract("Voting")
  m.call(voting, "addCandidate", ["Philippe"]);
  m.call(voting, "addCandidate", ["Ivan"]);
  m.call(voting, "addCandidate", ["Georges"]);

  m.call(voting, "addVoter", ["0x39467C4950E5eb6a41898Ad165fB984853B8d3B7"]);
  return { voting };
});