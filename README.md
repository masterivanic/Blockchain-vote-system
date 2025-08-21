## Groupe-C - Projet Blockchain – Système de vote (Hardhat + Solidity)


# Rôles & “qui a fait quoi” (équipe de 10)


Iles YAZI – DevOps Hardhat
hardhat.config.ts (localhost:8545, chainId 31337)
Scripts deploy.js, seed.js, scripts npm utiles




--------
Ce projet met en place un système de vote simple sur Ethereum (réseau local Hardhat) :

- Les électeurs ne peuvent voter qu’une seule fois
- Les résultats sont publics et vérifiables
- Interface en ligne de commande (scripts Node.js)

### Contenu du dépôt

- `contracts/Voting.sol` : smart contract Solidity
- `scripts/deploy.ts` : déploiement du contrat
- `scripts/simulate.ts` : simulation de votes multi-comptes et export des résultats
- `results/sample-simulation.json` : exemple de résultats
- `TEAM.md` : modèle de répartition des tâches dans l’équipe
- `.gitignore`, `.env.example`, `hardhat.config.ts`, `tsconfig.json`, `package.json`

### Prérequis

- Node.js LTS (>= 18)
- npm (fourni avec Node)

### Installation

1. Installer les dépendances

```bash
npm install
```

2. Compiler le smart contract

```bash
npx hardhat compile
```

### Exécution rapide (simulation locale)

Lance une simulation de votes sur le réseau local Hardhat et écrit un fichier de résultats dans `results/`.

```bash
npx hardhat run scripts/simulate.ts
```

Options (facultatif) :

- Définir vos candidats via variable d’environnement :

```bash
$env:CANDIDATES="Alice,Bob,Charlie"; npx hardhat run scripts/simulate.ts  # PowerShell
```

ou en arguments CLI :

```bash
npx hardhat run scripts/simulate.ts -- Alice Bob Charlie
```

Le script affichera un tableau de résultats et générera un fichier JSON daté dans `results/`.

### Déploiement simple (réseau local Hardhat)

```bash
npx hardhat run scripts/deploy.ts
```

Options pour les candidats :

```bash
$env:CANDIDATES="Alice,Bob,Charlie"; npx hardhat run scripts/deploy.ts  # PowerShell

# ou
npx hardhat run scripts/deploy.ts -- Alice Bob Charlie
```

Le script écrit un artefact d’adresse/ABI dans `deployments/local/Voting.json`.

### Smart contract – Règles

- Initialisation avec une liste de candidats
- `vote(candidateIndex)` : un seul vote par adresse, uniquement quand le vote est ouvert
- L’owner (déployeur) peut ouvrir/fermer le vote
- Lecture publique des résultats

### Livrables demandés

- Code du smart contract : `contracts/Voting.sol`
- Résultats de vote : exécuter `npx hardhat run scripts/simulate.ts` puis récupérer le JSON dans `results/`
- Répartition de l’équipe : compléter `TEAM.md`

### Structure

```
.
├─ contracts/
│  └─ Voting.sol
├─ scripts/
│  ├─ deploy.ts
│  └─ simulate.ts
├─ results/
│  └─ sample-simulation.json
├─ deployments/
│  └─ local/ (généré à l’exécution)
├─ hardhat.config.ts
├─ tsconfig.json
├─ package.json
├─ .env.example
└─ .gitignore
```

### Notes pédagogiques

- Les scripts utilisent les comptes par défaut du réseau Hardhat pour simuler plusieurs électeurs
- Le vote est ouvert par défaut à la création du contrat, puis peut être fermé
- Les événements `VoteCast`, `VotingOpened`, `VotingClosed` facilitent l’audit

### Licence

Projet éducatif – libre réutilisation dans un cadre pédagogique.


 
