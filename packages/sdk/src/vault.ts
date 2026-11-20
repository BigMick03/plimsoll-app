import { Contract } from "@stellar/stellar-sdk";
import { ContractClient, addr, big, i128, num, opt, type Raw } from "./contract";
import type { NetworkConfig, Tier } from "./types";

/** The vault's fixed coverage requirement. */
export interface VaultConfig {
  /** Coverage-ledger contract the vault consults. */
  ledger: string;
  /** SAC address of the asset the vault holds. */
  asset: string;
  minBps: number;
  /** Seconds. */
  maxAge: number;
  minTier: Tier;
}

export function decodeVaultConfig(raw: Raw): VaultConfig {
  return {
    ledger: String(raw.ledger),
    asset: String(raw.asset),
    minBps: num(raw.min_bps),
    maxAge: num(raw.max_age),
    minTier: num(raw.min_tier) as Tier,
  };
}

/**
 * Client for the reference covered vault. Deposits are refused while the asset
 * is not covered; withdrawals are never blocked. Writes return unsigned XDR.
 */
export class CoveredVaultClient extends ContractClient {
  readonly vault: Contract;

  constructor(config: NetworkConfig, vaultId: string) {
    super(config);
    this.vault = new Contract(vaultId);
  }

  async config(): Promise<VaultConfig | null> {
    return opt(await this.read(this.vault, "config", []), decodeVaultConfig);
  }

  /** Smallest units. */
  async balance(address: string): Promise<bigint> {
    const v = await this.read(this.vault, "balance", [addr(address)]);
    return v == null ? 0n : big(v);
  }

  /** Amount in smallest units, greater than zero. */
  async prepareDeposit(from: string, amount: bigint): Promise<string> {
    return this.prepare(from, this.vault.call("deposit", addr(from), i128(amount)));
  }

  async prepareWithdraw(to: string, amount: bigint): Promise<string> {
    return this.prepare(to, this.vault.call("withdraw", addr(to), i128(amount)));
  }
}
