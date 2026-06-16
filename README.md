# @greyw0rks/clarity-vote

JavaScript SDK for the [ClarityVote](https://github.com/greyw0rks/clarityvote) on-chain governance protocol on Stacks.

[![npm version](https://img.shields.io/npm/v/@greyw0rks/clarity-vote.svg)](https://www.npmjs.com/package/@greyw0rks/clarity-vote)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Install

```bash
npm install @greyw0rks/clarity-vote
```

> Requires `@stacks/transactions` and `@stacks/network` as peer dependencies.

## Overview

ClarityVote is an on-chain governance protocol for the Stacks ecosystem — STX-balance-weighted voting, vote delegation, and timelocked proposal execution, all enforced by Clarity smart contracts.

**Deployed on Stacks Mainnet:**

| Contract | Address |
|---|---|
| `clarityvote` | `SP1SY1E599GN04XRD2DQBKV7E62HYBJR2CT9S5QKK.clarityvote` |
| `clarityvote-delegation` | `SP1SY1E599GN04XRD2DQBKV7E62HYBJR2CT9S5QKK.clarityvote-delegation` |
| `clarityvote-timelock` | `SP1SY1E599GN04XRD2DQBKV7E62HYBJR2CT9S5QKK.clarityvote-timelock` |

## Usage

### Read a proposal

```js
import { getProposal, getNextProposalId } from '@greyw0rks/clarity-vote';

const id = await getNextProposalId(); // total proposals created
const proposal = await getProposal(1);
```

### Cast a vote

```js
import { buildCastVote, VOTE_CHOICES } from '@greyw0rks/clarity-vote';
import { makeContractCall, broadcastTransaction } from '@stacks/transactions';

const txOptions = {
  ...buildCastVote({ proposalId: 1, choice: VOTE_CHOICES.YES }),
  senderKey: privateKey,
  network,
};
const tx = await makeContractCall(txOptions);
await broadcastTransaction({ transaction: tx, network });
```

### Create a proposal

```js
import { buildCreateProposal } from '@greyw0rks/clarity-vote';
import { makeContractCall, uintCV, stringUtf8CV } from '@stacks/transactions';

const txOptions = {
  ...buildCreateProposal({
    title: 'Increase fee by 10%',
    description: 'Raise the protocol fee from 1% to 1.1%',
    durationBlocks: 144,
    quorum: 1_000_000n,
  }),
  senderKey: privateKey,
  network,
};
```

### Delegation

```js
import { buildDelegate, buildRevokeDelegation, getDelegation } from '@greyw0rks/clarity-vote/delegation';

// Delegate your voting weight
const tx = buildDelegate('SP2...your-delegate-address');

// Check who you're delegated to
const delegatee = await getDelegation('SP1...your-address');

// Revoke
const revoke = buildRevokeDelegation();
```

### Timelock

```js
import { isReady, blocksUntilEta, buildExecuteProposal } from '@greyw0rks/clarity-vote/timelock';

const ready = await isReady(1);
const blocksLeft = await blocksUntilEta(1);

if (ready) {
  const tx = buildExecuteProposal(1);
  // sign and broadcast...
}
```

## API

### Core (`@greyw0rks/clarity-vote`)

| Function | Description |
|---|---|
| `getProposal(id, network?)` | Fetch a proposal by ID |
| `getNextProposalId(network?)` | Get the next proposal ID (total count) |
| `hasVoted(proposalId, voter, network?)` | Check if an address has voted |
| `buildCreateProposal(params)` | Build a create-proposal tx payload |
| `buildCastVote(params)` | Build a cast-vote tx payload |
| `buildFinalizeProposal(id)` | Build a finalize-proposal tx payload |

### Delegation (`@greyw0rks/clarity-vote/delegation`)

| Function | Description |
|---|---|
| `getDelegation(address, network?)` | Get current delegatee |
| `getDelegatedWeight(address, network?)` | Get total delegated weight |
| `getEffectiveWeight(address, network?)` | Own balance + delegated weight |
| `buildDelegate(delegatee)` | Build a delegate tx payload |
| `buildRevokeDelegation()` | Build a revoke-delegation tx payload |
| `buildTransferDelegation(newDelegatee)` | Build a transfer-delegation tx payload |

### Timelock (`@greyw0rks/clarity-vote/timelock`)

| Function | Description |
|---|---|
| `getQueuedProposal(id, network?)` | Get a queued proposal |
| `isReady(id, network?)` | Check if ready to execute |
| `blocksUntilEta(id, network?)` | Blocks remaining until ETA |
| `getDelay(network?)` | Current timelock delay in blocks |
| `buildQueueProposal(id, desc)` | Build a queue-proposal tx payload |
| `buildExecuteProposal(id)` | Build an execute-proposal tx payload |
| `buildCancelProposal(id)` | Build a cancel-proposal tx payload |

## Constants

```js
import { VOTE_CHOICES, PROPOSAL_STATES, TIMELOCK_DEFAULTS, ERROR_CODES } from '@greyw0rks/clarity-vote';

VOTE_CHOICES.YES     // 1
VOTE_CHOICES.NO      // 2
VOTE_CHOICES.ABSTAIN // 3

PROPOSAL_STATES.ACTIVE    // 0
PROPOSAL_STATES.PASSED    // 1
PROPOSAL_STATES.REJECTED  // 2

TIMELOCK_DEFAULTS.DEFAULT_DELAY // 144 blocks (~1 Bitcoin day)
```

## Links

- [ClarityVote contracts](https://github.com/greyw0rks/clarityvote)
- [npm package](https://www.npmjs.com/package/@greyw0rks/clarity-vote)
- [Stacks blockchain](https://stacks.co)

## License

MIT
