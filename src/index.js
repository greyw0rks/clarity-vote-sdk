// @greyw0rks/clarity-vote
// SDK for ClarityVote on-chain governance on Stacks

export * from './core.js';
export * from './types.js';

export { getDelegation, getDelegatedWeight, getEffectiveWeight,
         buildDelegate, buildRevokeDelegation, buildTransferDelegation } from './delegation.js';

export { getQueuedProposal, isReady, blocksUntilEta, getDelay,
         buildQueueProposal, buildExecuteProposal, buildCancelProposal,
         TIMELOCK_DEFAULTS } from './timelock.js';

export const VERSION = '1.0.0';
export const PACKAGE = '@greyw0rks/clarity-vote';
