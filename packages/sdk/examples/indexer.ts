import { IndexerClient, Tier, bpsToPercent, formatUnits } from "@plimsoll/sdk";

const indexer = new IndexerClient("https://plimsoll-indexer.onrender.com");

// Every listed asset, with coverage judged against issuer-signed reports or stronger.
for (const asset of await indexer.listAssets(Tier.IssuerSigned)) {
  const cov = asset.coverage;
  if (cov?.bps == null) {
    console.log(asset.code, "no reading");
  } else {
    console.log(asset.code, bpsToPercent(cov.bps), "of", formatUnits(BigInt(cov.supply)));
  }
}
