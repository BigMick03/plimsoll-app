import { PlimsollContracts, TESTNET, Tier, bpsToPercent, formatUnits } from "@plimsoll/sdk";

const plimsoll = new PlimsollContracts(TESTNET);
const sac = TESTNET.assets.PUSD!.sac;

// Reserves over supply, from the latest report at or above the tier you ask for.
const cov = await plimsoll.coverage(sac, Tier.Transcribed);
if (cov) {
  console.log(bpsToPercent(cov.bps)); // e.g. "102.00%"; null when nothing is owed
  console.log(formatUnits(cov.reserves)); // e.g. "1,020,000"
}

// The yes/no answer a contract gets from `is_covered`: at least 100% backed,
// readings at most 7 days old, issuer-signed or stronger.
const ok = await plimsoll.isCovered(sac, 10_000, 7 * 86_400, Tier.IssuerSigned);
console.log(ok ? "accept" : "refuse");
