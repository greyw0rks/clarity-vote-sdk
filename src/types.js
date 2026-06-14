// @greyw0rks/clarity-vote — shared types and constants

export const DEPLOYER = 'SP1SY1E599GN04XRD2DQBKV7E62HYBJR2CT9S5QKK';

export const CONTRACTS = {
  core:       { address: DEPLOYER, name: 'clarityvote' },
  delegation: { address: DEPLOYER, name: 'clarityvote-delegation' },
  timelock:   { address: DEPLOYER, name: 'clarityvote-timelock' },
};

export const VOTE_CHOICES = {
  YES:     1,
  NO:      2,
  ABSTAIN: 3,
};

export const PROPOSAL_STATES = {
  ACTIVE:   0,
  PASSED:   1,
  REJECTED: 2,
  TIED:     3,
};

export const TIMELOCK_DEFAULTS = {
  DEFAULT_DELAY:  144,   // ~1 Bitcoin day
  MAX_DELAY:      1008,  // ~7 Bitcoin days
  GRACE_PERIOD:   288,   // ~2 Bitcoin days
};

export const ERROR_CODES = {
  core: {
    100: 'ERR_NOT_AUTHORIZED',
    101: 'ERR_NOT_FOUND',
    102: 'ERR_INVALID_STATE',
    103: 'ERR_ALREADY_VOTED',
    104: 'ERR_WINDOW_CLOSED',
    105: 'ERR_WINDOW_OPEN',
    106: 'ERR_ZERO_AMOUNT',
    107: 'ERR_INVALID_CHOICE',
    108: 'ERR_TITLE_TOO_LONG',
  },
  delegation: {
    100: 'ERR_NOT_AUTHORIZED',
    101: 'ERR_SELF_DELEGATE',
    102: 'ERR_ALREADY_DELEGATED',
    103: 'ERR_NO_DELEGATION',
    104: 'ERR_CIRCULAR_DELEGATION',
    105: 'ERR_ZERO_BALANCE',
  },
  timelock: {
    100: 'ERR_NOT_AUTHORIZED',
    101: 'ERR_ALREADY_QUEUED',
    102: 'ERR_NOT_QUEUED',
    103: 'ERR_DELAY_NOT_MET',
    104: 'ERR_ALREADY_EXECUTED',
    105: 'ERR_EXPIRED',
    106: 'ERR_INVALID_DELAY',
    107: 'ERR_CANCELLED',
  },
};
