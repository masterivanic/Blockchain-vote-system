window.CONTRACT_ABI = [
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"candidateId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"}],"name":"CandidateAdded","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"voter","type":"address"}],"name":"VoterAdded","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"voter","type":"address"},{"indexed":false,"internalType":"uint256","name":"candidateId","type":"uint256"}],"name":"VoteCast","type":"event"},
    {"inputs":[{"internalType":"string","name":"_name","type":"string"}],"name":"addCandidate","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"addVoter","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"candidates","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"voteCount","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"_candidateId","type":"uint256"}],"name":"getCandidate","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"voteCount","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"_voter","type":"address"}],"name":"getVoter","outputs":[{"internalType":"bool","name":"isAllowed","type":"bool"},{"internalType":"bool","name":"hasVoted","type":"bool"},{"internalType":"uint256","name":"votedCandidateId","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"_candidateId","type":"uint256"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"voters","outputs":[{"internalType":"bool","name":"isAllowed","type":"bool"},{"internalType":"bool","name":"hasVoted","type":"bool"},{"internalType":"uint256","name":"votedCandidateId","type":"uint256"}],"stateMutability":"view","type":"function"}
];
