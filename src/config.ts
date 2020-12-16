import dotenv from "dotenv";

interface Env {
  PHRASE_1: string;
  PHRASE_2: string;
  GENESIS_TX: string;
  GENESIS_HASH: string;
  ACCOUNT_1_ADDRESS: string;
  ACCOUNT_1_WIF: string;
  ACCOUNT_2_ADDRESS: string;
  ACCOUNT_2_WIF: string;
  SATOSHI_ADDRESS: string;
}

dotenv.config();

export const constants = {
  Bitcoin: {
    decimals: 8,
    symbol: "BTC",
    networkId: {
      MAINNET: 0,
      TESTNET: 1,
    },
    networkName: {
      MAINNET: "mainnet",
      TESTNET: "testnet",
    },
  },
};

export const env = (process.env as any) as Env;

export default env;
