// @greyw0rks/clarity-vote/timelock
// Helpers for clarityvote-timelock contract

import { CONTRACTS, TIMELOCK_DEFAULTS } from './types.js';

const API_BASE = {
  mainnet: 'https://api.hiro.so',
  testnet: 'https://api.testnet.hiro.so',
};

/**
 * Get a queued proposal by ID (read-only).
 * @param {number} proposalId
 * @param {'mainnet'|'testnet'} [network='mainnet']
 * @returns {Promise<object|null>}
 */
export async function getQueuedProposal(proposalId, network = 'mainnet') {
  const base = API_BASE[network];
  const { address, name } = CONTRACTS.timelock;
  const res = await fetch(
    `${base}/v2/contracts/call-read/${address}/${name}/get-proposal`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: address,
        arguments: [`0x${numberToUintCV(proposalId)}`],
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.result ? { raw: data.result } : null;
}

/**
 * Check if a proposal is ready to execute (delay elapsed, not expired).
 * @param {number} proposalId
 * @param {'mainnet'|'testnet'} [network='mainnet']
 * @returns {Promise<boolean>}
 */
export async function isReady(proposalId, network = 'mainnet') {
  const base = API_BASE[network];
  const { address, name } = CONTRACTS.timelock;
  const res = await fetch(
    `${base}/v2/contracts/call-read/${address}/${name}/is-ready`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: address,
        arguments: [`0x${numberToUintCV(proposalId)}`],
      }),
    }
  );
  if (!res.ok) return false;
  const data = await res.json();
  return data.result === '0x03'; // Clarity true
}

/**
 * Get how many burn blocks remain until a proposal's ETA.
 * @param {number} proposalId
 * @param {'mainnet'|'testnet'} [network='mainnet']
 * @returns {Promise<number>}
 */
export async function blocksUntilEta(proposalId, network = 'mainnet') {
  const base = API_BASE[network];
  const { address, name } = CONTRACTS.timelock;
  const res = await fetch(
    `${base}/v2/contracts/call-read/${address}/${name}/blocks-until-eta`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: address,
        arguments: [`0x${numberToUintCV(proposalId)}`],
      }),
    }
  );
  if (!res.ok) return 0;
  const data = await res.json();
  return data.result ? Number(clarityHexToUint(data.result)) : 0;
}

/**
 * Get current timelock delay in burn blocks.
 * @param {'mainnet'|'testnet'} [network='mainnet']
 * @returns {Promise<number>}
 */
export async function getDelay(network = 'mainnet') {
  const base = API_BASE[network];
  const { address, name } = CONTRACTS.timelock;
  const res = await fetch(
    `${base}/v2/contracts/call-read/${address}/${name}/get-delay`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: address, arguments: [] }),
    }
  );
  if (!res.ok) return TIMELOCK_DEFAULTS.DEFAULT_DELAY;
  const data = await res.json();
  return data.result ? Number(clarityHexToUint(data.result)) : TIMELOCK_DEFAULTS.DEFAULT_DELAY;
}

/**
 * Build a queue-proposal transaction payload (admin only).
 * @param {number} proposalId
 * @param {string} description
 * @returns {object} params for makeContractCall
 */
export function buildQueueProposal(proposalId, description) {
  return {
    contractAddress: CONTRACTS.timelock.address,
    contractName:    CONTRACTS.timelock.name,
    functionName:    'queue-proposal',
    functionArgs:    [proposalId, description],
  };
}

/**
 * Build an execute-proposal transaction payload (admin only).
 * @param {number} proposalId
 * @returns {object} params for makeContractCall
 */
export function buildExecuteProposal(proposalId) {
  return {
    contractAddress: CONTRACTS.timelock.address,
    contractName:    CONTRACTS.timelock.name,
    functionName:    'execute-proposal',
    functionArgs:    [proposalId],
  };
}

/**
 * Build a cancel-proposal transaction payload (admin only).
 * @param {number} proposalId
 * @returns {object} params for makeContractCall
 */
export function buildCancelProposal(proposalId) {
  return {
    contractAddress: CONTRACTS.timelock.address,
    contractName:    CONTRACTS.timelock.name,
    functionName:    'cancel-proposal',
    functionArgs:    [proposalId],
  };
}

export { TIMELOCK_DEFAULTS };

// ── Internal helpers ──────────────────────────────────────────────────────────

function numberToUintCV(n) {
  const buf = Buffer.alloc(17);
  buf[0] = 0x01;
  let big = BigInt(n);
  for (let i = 16; i >= 1; i--) {
    buf[i] = Number(big & 0xffn);
    big >>= 8n;
  }
  return buf.toString('hex');
}

function clarityHexToUint(hex) {
  try {
    const buf = Buffer.from(hex.replace('0x', ''), 'hex');
    if (buf.length < 17) return 0n;
    let val = 0n;
    for (let i = 1; i <= 16; i++) val = (val << 8n) | BigInt(buf[i]);
    return val;
  } catch {
    return 0n;
  }
}
