// @greyw0rks/clarity-vote/core
// Read-only and write helpers for the clarityvote contract

import { CONTRACTS, VOTE_CHOICES, PROPOSAL_STATES } from './types.js';

const API_BASE = {
  mainnet: 'https://api.hiro.so',
  testnet: 'https://api.testnet.hiro.so',
};

/**
 * Fetch a proposal by ID (read-only).
 * @param {number} proposalId
 * @param {'mainnet'|'testnet'} [network='mainnet']
 * @returns {Promise<object|null>}
 */
export async function getProposal(proposalId, network = 'mainnet') {
  const base = API_BASE[network];
  const { address, name } = CONTRACTS.core;
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
  return data.result ? parseClarityValue(data.result) : null;
}

/**
 * Get the next proposal ID (read-only).
 * @param {'mainnet'|'testnet'} [network='mainnet']
 * @returns {Promise<number|null>}
 */
export async function getNextProposalId(network = 'mainnet') {
  const base = API_BASE[network];
  const { address, name } = CONTRACTS.core;
  const res = await fetch(
    `${base}/v2/contracts/call-read/${address}/${name}/get-next-id`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: address, arguments: [] }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.result ? clarityHexToUint(data.result) : null;
}

/**
 * Check if an address has voted on a proposal (read-only).
 * @param {number} proposalId
 * @param {string} voterAddress
 * @param {'mainnet'|'testnet'} [network='mainnet']
 * @returns {Promise<boolean>}
 */
export async function hasVoted(proposalId, voterAddress, network = 'mainnet') {
  const base = API_BASE[network];
  const { address, name } = CONTRACTS.core;
  const res = await fetch(
    `${base}/v2/contracts/call-read/${address}/${name}/has-voted`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: address,
        arguments: [
          `0x${numberToUintCV(proposalId)}`,
          `0x${principalToHex(voterAddress)}`,
        ],
      }),
    }
  );
  if (!res.ok) return false;
  const data = await res.json();
  return data.result === '0x03'; // Clarity true
}

/**
 * Build a create-proposal transaction payload.
 * @param {{ title: string, description: string, durationBlocks: number, quorum: bigint }} params
 * @returns {object} params for makeContractCall
 */
export function buildCreateProposal({ title, description, durationBlocks, quorum }) {
  return {
    contractAddress: CONTRACTS.core.address,
    contractName:    CONTRACTS.core.name,
    functionName:    'create-proposal',
    functionArgs:    [title, description, durationBlocks, quorum], // pass CV values
  };
}

/**
 * Build a cast-vote transaction payload.
 * @param {{ proposalId: number, choice: 1|2|3 }} params
 * @returns {object} params for makeContractCall
 */
export function buildCastVote({ proposalId, choice }) {
  if (![1, 2, 3].includes(choice)) throw new Error(`Invalid choice: ${choice}. Use VOTE_CHOICES.YES/NO/ABSTAIN`);
  return {
    contractAddress: CONTRACTS.core.address,
    contractName:    CONTRACTS.core.name,
    functionName:    'cast-vote',
    functionArgs:    [proposalId, choice],
  };
}

/**
 * Build a finalize-proposal transaction payload.
 * @param {number} proposalId
 * @returns {object} params for makeContractCall
 */
export function buildFinalizeProposal(proposalId) {
  return {
    contractAddress: CONTRACTS.core.address,
    contractName:    CONTRACTS.core.name,
    functionName:    'finalize-proposal',
    functionArgs:    [proposalId],
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function numberToUintCV(n) {
  // Minimal Clarity uint serialization (type=0x01, 16-byte big-endian)
  const buf = Buffer.alloc(17);
  buf[0] = 0x01;
  const big = BigInt(n);
  for (let i = 16; i >= 1; i--) {
    buf[i] = Number(big & 0xffn);
    // shifting done manually to avoid BigInt issues
  }
  return buf.toString('hex');
}

function clarityHexToUint(hex) {
  try {
    const buf = Buffer.from(hex.replace('0x', ''), 'hex');
    if (buf.length < 17) return null;
    let val = BigInt(0);
    for (let i = 1; i <= 16; i++) val = (val << 8n) | BigInt(buf[i]);
    return Number(val);
  } catch {
    return null;
  }
}

function parseClarityValue(hex) {
  // Returns raw hex for callers to decode; avoids heavy dependency
  return { raw: hex };
}

function principalToHex(address) {
  // Minimal principal encoding — callers should use @stacks/transactions principalCV
  return Buffer.from(`\x05\x1a${address}`).toString('hex');
}

export { VOTE_CHOICES, PROPOSAL_STATES };
