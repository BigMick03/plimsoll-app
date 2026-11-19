import {
  IndexerClient,
  PlimsollContracts,
  TESTNET,
  matchesHash,
  parseBreakdown,
} from "@plimsoll/sdk";

const plimsoll = new PlimsollContracts(TESTNET);
const indexer = new IndexerClient("https://plimsoll-indexer.onrender.com");
const sac = TESTNET.assets.PUSD!.sac;

// The supply poster records the total and a sha256 of its per-bucket breakdown.
const supply = await plimsoll.getSupply(sac);
if (!supply) throw new Error("no supply snapshot yet");

// Check the breakdown bytes against the on-chain hash before trusting them.
const bytes = await indexer.breakdown(supply.breakdownHash);
if (!(await matchesHash(bytes, supply.breakdownHash))) {
  throw new Error("breakdown does not match the hash recorded on-chain");
}

const breakdown = parseBreakdown(bytes);
console.log(breakdown.total === supply.amount.toString()); // true: the total that was posted
console.log(breakdown.liquidity_pools, breakdown.claimable_balances); // smallest units
