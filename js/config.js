window.APP_CONFIG = {
    CONTRACT_ADDRESS: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    // Autoriser 31337 (Hardhat) ET 1337 (Ganache) pour éviter les surprises
    ALLOWED_CHAIN_IDS: ["0x7A69", "0x539"], // 31337 (0x7A69), 1337 (0x539)
    DEFAULT_CHAIN_ID: "0x7A69",             // on tente 31337 en premier
    RPC_URL: "http://127.0.0.1:8545/",
    DEPLOYMENT_BLOCK: 0
};
