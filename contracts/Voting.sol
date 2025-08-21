// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Système de vote simple
/// @notice Chaque adresse peut voter une seule fois pour un candidat donné.
contract Voting {
    address public owner;
    bool public isOpen;

    string[] private candidates;

    // Adresse => a-t-elle voté ?
    mapping(address => bool) public hasVoted;
    // Index du candidat => nombre de votes
    mapping(uint256 => uint256) private candidateVotes;
    uint256 public totalVotes;

    event VoteCast(address indexed voter, uint256 indexed candidateIndex);
    event VotingOpened();
    event VotingClosed();

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyWhenOpen() {
        require(isOpen, "Voting closed");
        _;
    }

    /// @param _candidates Liste des candidats (au moins 1)
    /// @param _startOpen Démarrer le vote ouvert ou fermé
    constructor(string[] memory _candidates, bool _startOpen) {
        require(_candidates.length >= 1, "At least one candidate");
        owner = msg.sender;
        isOpen = _startOpen;
        for (uint256 i = 0; i < _candidates.length; i++) {
            candidates.push(_candidates[i]);
        }
    }

    function openVoting() external onlyOwner {
        require(!isOpen, "Already open");
        isOpen = true;
        emit VotingOpened();
    }

    function closeVoting() external onlyOwner {
        require(isOpen, "Already closed");
        isOpen = false;
        emit VotingClosed();
    }

    /// @notice Vote pour un candidat par son index
    function vote(uint256 candidateIndex) external onlyWhenOpen {
        require(candidateIndex < candidates.length, "Invalid candidate");
        require(!hasVoted[msg.sender], "Already voted");

        hasVoted[msg.sender] = true;
        candidateVotes[candidateIndex] += 1;
        totalVotes += 1;
        emit VoteCast(msg.sender, candidateIndex);
    }

    function numCandidates() external view returns (uint256) {
        return candidates.length;
    }

    function getCandidateName(uint256 candidateIndex) external view returns (string memory) {
        require(candidateIndex < candidates.length, "Invalid candidate");
        return candidates[candidateIndex];
    }

    function getCandidates() external view returns (string[] memory) {
        return candidates;
    }

    /// @return votes tableau des votes par index de candidat
    function getResults() external view returns (uint256[] memory votes) {
        votes = new uint256[](candidates.length);
        for (uint256 i = 0; i < candidates.length; i++) {
            votes[i] = candidateVotes[i];
        }
    }
}


