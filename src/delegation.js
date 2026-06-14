// @greyw0rks/clarity-vote/delegation
// Helpers for clarityvote-delegation contract

import { CONTRACTS, ERROR_CODES } from './types.js';

const API_BASE = {
  mainnet: 'https://api.hiro.so',
  testnet: 'https://api.testnet.hiro.so',
};

/**
 * Get the current delegatee for a delegator address (read-only).
 * @param {string} delegatorAddress
 * @param {'mainnet'|'testnet'} [network='mainnet']
 * @returns {Promise<string|null>} delegatee address or null if not delegated
 */
export async function getDelegation(delegatorAddress, network = 'mainnet') {
  const base = API_BASE[network];
  const { address, name } = CONTRACTS.delegation;
  const res = await fetch(
    `${base}/v2/contracts/call-read/${address}/${name}/get-delegation`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: address,
        arguments: [`0x${principalToHex(delegatorAddress)}`],
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.result || data.result === '0x09') return null; // none
  return data.result;
}

/**
 * Get the delegated voting weight for an address (read-only).
 * @param {string} delegateeAddress
 * @param {'mainnet'|'testnet'} [network='mainnet']
 * @returns {Promise<bigint>}
 */
export async function getDelegatedWeight(delegateeAddress, network = 'mainnet') {
  const base = API_BASE[network];
  const { address, name } = CONTRACTS.delegation;
  const res = await fetch(
    `${base}/v2/contracts/call-read/${address}/${name}/get-delegated-weight`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: address,
        arguments: [`0x${principalToHex(delegateeAddress)}`],
      }),
    }
  );
  if (!res.ok) return 0n;
  const data = await res.json();
  return data.result ? clarityHexToUint(data.result) : 0n;
}

/**
 * Get effective voting weight (own STX balance + delegated weight).
 * @param {string} voterAddress
 * @param {'mainnet'|'testnet'} [network='mainnet']
 * @returns {Promise<bigint>}
 */
export async function getEffectiveWeight(voterAddress, network = 'mainnet') {
  const base = API_BASE[network];
  const { address, name } = CONTRACTS.delegation;
  const res = await fetch(
    `${base}/v2/contracts/call-read/${address}/${name}/get-effective-weight`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: address,
        arguments: [`0x${principalToHex(voterAddress)}`],
      }),
    }
  );
  if (!res.ok) return 0n;
  const data = await res.json();
  return data.result ? clarityHexToUint(data.result) : 0n;
}

/**
 * Build a delegate transaction payload.
 * @param {string} delegateeAddress
 * @returns {object} params for makeContractCall
 */
export function buildDelegate(delegateeAddress) {
  return {
    contractAddress: CONTRACTS.delegation.address,
    contractName:    CONTRACTS.delegation.name,
    functionName:    'delegate',
    functionArgs:    [delegateeAddress], // pass principalCV(delegateeAddress)
  };
}

/**
 * Build a revoke-delegation transaction payload.
 * @returns {object} params for makeContractCall
 */
export function buildRevokeDelegation() {
  return {
    contractAddress: CONTRACTS.delegation.address,
    contractName:    CONTRACTS.delegation.name,
    functionName:    'revoke-delegation',
    functionArgs:    [],
  };
}

/**
 * Build a transfer-delegation transaction payload.
 * @param {string} newDelegateeAddress
 * @returns {object} params for makeContractCall
 */
export function buildTransferDelegation(newDelegateeAddress) {
  return {
    contractAddress: CONTRACTS.delegation.address,
    contractName:    CONTRACTS.delegation.name,
    functionName:    'transfer-delegation',
    functionArgs:    [newDelegateeAddress],
  };
}

export { ERROR_CODES };

// ── Internal helpers ──────────────────────────────────────────────────────────

function principalToHex(address) {
  return Buffer.from(`\x05\x1a${address}`).toString('hex');
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
