/***************
 * Globals
 ***************/
const { CONTRACT_ADDRESS, ALLOWED_CHAIN_IDS, DEFAULT_CHAIN_ID, RPC_URL, DEPLOYMENT_BLOCK } = window.APP_CONFIG;
const ABI = window.CONTRACT_ABI;

let web3;
let contract;
let account = null;
let isOwner = false;
let tab = 'mine';
let candCache = [];

/***************
 * Helpers UI
 ***************/
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const short = (addr) => addr ? addr.slice(0,6) + '…' + addr.slice(-4) : '';
const show = (el, v=true) => el.style.display = v ? '' : 'none';
const snackbar = (msg) => { const el = $('#snackbar'); el.textContent = msg; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 2800); };
function escapeHtml(str) { return String(str).replace(/[&<>\"]/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[s] || s)); }

/***************
 * Network utils
 ***************/
async function ensureLocalNetwork() {
    if (!window.ethereum) return;

    const current = await window.ethereum.request({ method: 'eth_chainId' }).catch(()=>null);
    if (current && ALLOWED_CHAIN_IDS.includes(current)) return;

    // DEFAULT_CHAIN_ID (31337 par défaut)
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: DEFAULT_CHAIN_ID }]
        });
        return;
    } catch (e) {
        // Si la chaîne n'existe pas encore dans MetaMask → l'ajouter
        if (e && e.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: DEFAULT_CHAIN_ID, // 0x7A69 (31337) ou 0x539 (1337)
                        chainName: DEFAULT_CHAIN_ID === "0x539" ? "Localhost (1337)" : "Hardhat Local (31337)",
                        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                        rpcUrls: [RPC_URL]
                    }]
                });
            } catch (e2) {
                console.warn('Ajout de réseau annulé/échoué', e2);
            }
        }
    }
}

/***************
 * Badges
 ***************/
const setBadges = async () => {
    const connBadge = $('#connBadge');
    const netBadge = $('#netBadge');
    const contractBadge = $('#contractBadge');

    if (!account) {
        connBadge.textContent = 'Non connecté';
        connBadge.className = 'badge badge-err';
        netBadge.textContent = 'Réseau: inconnu';
        contractBadge.textContent = 'Contrat: —';
        return;
    }

    connBadge.textContent = 'Connecté';
    connBadge.className = 'badge badge-ok';

    try {
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const names = { "0x1":"Ethereum", "0x5":"Goerli", "0xaa36a7":"Sepolia", "0x89":"Polygon", "0x13881":"Mumbai", "0x7a69":"Hardhat", "0x539":"Localhost" };
        netBadge.textContent = `Réseau: ${names[chainIdHex.toLowerCase()] || chainIdHex}`;
    } catch(e) { netBadge.textContent = 'Réseau: inconnu'; }

    try {
        const code = await web3.eth.getCode(CONTRACT_ADDRESS);
        if (code && code !== '0x') { contractBadge.textContent = 'Contrat: OK'; contractBadge.className = 'badge badge-ok'; }
        else { contractBadge.textContent = 'Contrat: introuvable'; contractBadge.className = 'badge badge-err'; }
    } catch(e) { contractBadge.textContent = 'Contrat: erreur'; contractBadge.className = 'badge badge-warn'; }
};

/***************
 * Init & wallet
 ***************/
const init = async () => {
    if (!window.ethereum) { snackbar('MetaMask non détecté. Installe-le pour continuer.'); return; }

    await ensureLocalNetwork();

    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

    try {
        const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accs && accs.length) { account = accs[0]; }
    } catch (e) {}

    await postConnectUI();

    window.ethereum.on('accountsChanged', async (accs) => { account = accs && accs.length ? accs[0] : null; await postConnectUI(); });
    window.ethereum.on('chainChanged', () => window.location.reload());

    // Listeners
    $('#btnConnect').addEventListener('click', connectWallet);
    $('#btnRetry').addEventListener('click', connectWallet);
    $('#btnCopy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(account); snackbar('Adresse copiée.'); } catch(e) {} });
    $('#btnDisconnect').addEventListener('click', () => {
        account = null; isOwner = false; updateWalletUI();
        $('#voterStatus').innerHTML = '<div class="subtle">Connectez votre portefeuille pour voir votre statut.</div>';
        $('#candList').innerHTML = '<div class="subtle">Connectez-vous pour charger les candidats.</div>';
        $('#history').innerHTML = '<div class="subtle">Aucun historique.</div>';
        setBadges();
    });

    $('#btnAddCand').addEventListener('click', onAddCandidate);
    $('#btnAllowVoter').addEventListener('click', onAllowVoter);
    $('#btnRefreshCand').addEventListener('click', loadCandidates);
    $('#btnRefreshHistory').addEventListener('click', loadHistory);
    $('#btnManualVote').addEventListener('click', onManualVote);
    $('#manualVoteInput').addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ onManualVote(); }});

    $('#tabMine').addEventListener('click', () => { tab='mine'; setTabUI(); loadHistory(); });
    $('#tabAll').addEventListener('click', () => { tab='all'; setTabUI(); loadHistory(); });
};

const connectWallet = async () => {
    if (!window.ethereum) return snackbar('MetaMask non détecté.');
    try {
        const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
        account = accs[0];
        await postConnectUI();
        snackbar('Portefeuille connecté.');
    } catch (e) { snackbar('Connexion refusée.'); }
};

const postConnectUI = async () => {
    updateWalletUI();
    await setBadges();
    if (account) {
        await checkOwner();
        await Promise.all([ loadCandidates(), loadVoterStatus(), loadHistory() ]);
        subscribeLight();
    }
};

const updateWalletUI = () => {
    if (account) {
        $('#accountAddr').textContent = account;
        show($('#accountRow'), true);
        show($('#connectRow'), false);
        show($('#btnRetry'), false);
        $('#connBadge').className = 'badge badge-ok';
    } else {
        show($('#accountRow'), false);
        show($('#connectRow'), true);
        show($('#btnRetry'), true);
        $('#connBadge').className = 'badge badge-err';
    }
};

const checkOwner = async () => {
    try {
        const owner = await contract.methods.owner().call();
        isOwner = owner && account && owner.toLowerCase() === account.toLowerCase();
        show($('#adminCard'), isOwner);
        show($('#ownerInfo'), isOwner);
    } catch (e) {
        isOwner = false;
        show($('#adminCard'), false);
        show($('#ownerInfo'), false);
    }
};

/***************
 * Candidats & vote
 ***************/
const MAX_CANDIDATES = 100;

const loadCandidates = async () => {
    const box = $('#candList');
    box.innerHTML = '<div class="subtle">Chargement…</div>';
    if (!contract) return;

    const items = [];
    for (let i=0;i<MAX_CANDIDATES;i++) {
        try {
            const c = await contract.methods.getCandidate(i).call();
            if (!c.name && c.voteCount === '0') break;
            items.push({ id: i, name: c.name, votes: c.voteCount });
        } catch (e) { break; }
    }
    candCache = items;

    if (!items.length) { box.innerHTML = '<div class="subtle">Aucun candidat pour le moment.</div>'; return; }

    box.innerHTML = '';
    for (const it of items) {
        const el = document.createElement('div');
        el.className = 'item';
        el.innerHTML = `
      <div>
        <div style="font-weight:700">${escapeHtml(it.name)}</div>
        <div class="subtle">ID: ${it.id} • <span class="badge">${it.votes} vote(s)</span></div>
      </div>
      <button class="btn" data-id="${it.id}">Voter</button>
    `;
        el.querySelector('button').addEventListener('click', () => voteFor(it.id));
        box.appendChild(el);
    }
};

const voteFor = async (id) => {
    if (!account) return snackbar('Connecte ton portefeuille.');
    try {
        const v = await contract.methods.getVoter(account).call();
        if (!v.isAllowed) return snackbar("Tu n'es pas autorisé à voter.");
        if (v.hasVoted) return snackbar('Tu as déjà voté.');
    } catch(e) { return snackbar("Statut de votant inconnu. Es-tu bien autorisé ?"); }
    if (!confirm(`Confirmer le vote pour le candidat #${id} ?`)) return;
    try {
        await contract.methods.vote(id).send({ from: account });
        snackbar('Vote enregistré ✅');
        await Promise.all([loadCandidates(), loadVoterStatus(), loadHistory()]);
    } catch (e) {
        snackbar('Échec du vote: ' + (e?.message?.split('\n')[0] || 'Erreur'));
    }
};

const loadVoterStatus = async () => {
    const box = $('#voterStatus');
    if (!account) return box.innerHTML = '<div class="subtle">Connectez votre portefeuille pour voir votre statut.</div>';
    try {
        const v = await contract.methods.getVoter(account).call();
        let html = '';
        html += v.isAllowed ? '<span class="badge badge-ok">Autorisé à voter</span>' : '<span class="badge badge-err">Non autorisé</span>';
        html += ' ';
        html += v.hasVoted ? '<span class="badge">A déjà voté</span>' : '<span class="badge">Pas encore voté</span>';
        if (v.hasVoted) {
            try {
                const c = await contract.methods.getCandidate(v.votedCandidateId).call();
                html += `<div class="subtle">Ton vote: <strong>${escapeHtml(c.name)}</strong> (ID ${v.votedCandidateId})</div>`;
            } catch(e) {
                html += `<div class="subtle">Ton vote: candidat #${v.votedCandidateId}</div>`;
            }
        }
        box.innerHTML = html;
    } catch(e) {
        box.innerHTML = '<span class="badge badge-warn">Impossible de récupérer ton statut (non inscrit ?)</span>';
    }
};

/***************
 * Admin
 ***************/
const onAddCandidate = async () => {
    if (!isOwner) return snackbar("Réservé à l'admin.");
    const name = $('#candName').value.trim();
    if (!name) return snackbar('Nom requis.');
    try {
        await contract.methods.addCandidate(name).send({ from: account });
        $('#candName').value = '';
        snackbar('Candidat créé.');
        await loadCandidates();
    } catch(e) {
        snackbar('Échec création: ' + (e?.message?.split('\n')[0] || 'Erreur'));
    }
};

const onAllowVoter = async () => {
    if (!isOwner) return snackbar("Réservé à l'admin.");
    const addr = $('#voterAddr').value.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) return snackbar('Adresse invalide.');
    try {
        await contract.methods.addVoter(addr).send({ from: account });
        $('#voterAddr').value='';
        snackbar('Votant autorisé.');
        await loadVoterStatus();
    } catch(e) {
        snackbar("Échec d'autorisation: " + (e?.message?.split('\n')[0] || 'Erreur'));
    }
};

/***************
 * Historique (events)
 ***************/
const setTabUI = () => {
    $('#tabMine').classList.toggle('active', tab==='mine');
    $('#tabAll').classList.toggle('active', tab==='all');
};

const loadHistory = async () => {
    const box = $('#history');
    box.innerHTML = '<div class="subtle">Chargement…</div>';
    if (!contract) return;
    try {
        const events = await contract.getPastEvents('VoteCast', { fromBlock: DEPLOYMENT_BLOCK, toBlock: 'latest' });
        const byBlock = {};
        const blocks = [...new Set(events.map(e => e.blockNumber))];
        const blockInfos = await Promise.all(blocks.map(bn => web3.eth.getBlock(bn)));
        blockInfos.forEach(b => byBlock[b.number] = b.timestamp);

        const rows = [];
        for (const ev of events) {
            const voter = ev.returnValues.voter;
            const candId = parseInt(ev.returnValues.candidateId);
            let candName = `#${candId}`;
            try {
                const c = await contract.methods.getCandidate(candId).call();
                if (c && c.name) candName = c.name;
            } catch {}
            const when = new Date((byBlock[ev.blockNumber] || Date.now()/1000) * 1000);
            rows.push({ voter, candId, candName, when, block: ev.blockNumber, tx: ev.transactionHash });
        }

        const filtered = tab==='mine' && account ? rows.filter(r => r.voter.toLowerCase() === account.toLowerCase()) : rows;
        filtered.sort((a,b) => b.when - a.when);

        if (!filtered.length) { box.innerHTML = '<div class="subtle">Aucun événement.</div>'; return; }

        box.innerHTML = '';
        for (const r of filtered.slice(0, 200)) {
            const el = document.createElement('div');
            el.className = 'item';
            el.innerHTML = `
        <div>
          <div><strong>${escapeHtml(r.candName)}</strong></div>
          <div class="subtle">Votant: <span class="mono">${short(r.voter)}</span> • Bloc ${r.block} • ${r.when.toLocaleString()}</div>
        </div>
        <button class="btn btn-ghost" onclick="navigator.clipboard.writeText('${r.tx}').then(()=>snackbar('Hash copié.'))">Tx</button>
      `;
            box.appendChild(el);
        }
    } catch (e) {
        box.innerHTML = '<div class="subtle">Impossible de charger les événements (réseau ou droits restreints).</div>';
    }
};

let lightInterval = null;
const subscribeLight = () => {
    if (lightInterval) clearInterval(lightInterval);
    lightInterval = setInterval(() => { loadCandidates(); loadHistory(); loadVoterStatus(); }, 15000);
};

window.addEventListener('load', init);
