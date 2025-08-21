pragma solidity >=0.7.0 <0.9.0;

contract Voting {
    struct Voter {
        bool isAllowed;
        bool hasVoted;
        uint votedCandidateId;
    }

    struct Candidate {
        string name;
        uint voteCount;
    }

    address public owner;
    mapping(address => Voter) public voters;
    Candidate[] public candidates;

    event VoterAdded(address voter);
    event CandidateAdded(uint candidateId, string name);
    event VoteCast(address voter, uint candidateId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addVoter(address _voter) public onlyOwner {
        require(!voters[_voter].isAllowed, "Voter already added");
        voters[_voter] = Voter({
            isAllowed: true,
            hasVoted: false,
            votedCandidateId: 0
        });
        emit VoterAdded(_voter);
    }

    function addCandidate(string memory _name) public onlyOwner {
        candidates.push(Candidate({
            name: _name,
            voteCount: 0
        }));
        emit CandidateAdded(candidates.length - 1, _name);
    }

    function vote(uint _candidateId) public {
        require(voters[msg.sender].isAllowed, "Not allowed to vote");
        require(!voters[msg.sender].hasVoted, "Already voted");
        require(_candidateId < candidates.length, "Invalid candidate");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = _candidateId;
        candidates[_candidateId].voteCount++;

        emit VoteCast(msg.sender, _candidateId);
    }

    function getCandidate(uint _candidateId) public view returns (string memory name, uint voteCount) {
        require(_candidateId < candidates.length, "Invalid candidate");
        return (candidates[_candidateId].name, candidates[_candidateId].voteCount);
    }

    function getVoter(address _voter) public view returns (bool isAllowed, bool hasVoted, uint votedCandidateId) {
        return (voters[_voter].isAllowed, voters[_voter].hasVoted, voters[_voter].votedCandidateId);
    }
}