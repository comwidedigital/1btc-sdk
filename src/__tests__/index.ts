import { expect } from "chai";
import { TxHistory } from "../models/tx-history";
import { calcTx, getAccount, getFee, getTxHistory, getUSDPrice } from "../api";
import config from "../config";
import {
  fromSatoshi,
  hexTohashId,
  satoshiToUsd,
  toSatoshi,
  UsdToSatoshi,
} from "../utils";
import { hash, hex } from "./fixtures/tx";
import { txInputs } from "./fixtures/tx-inputs";

let history: TxHistory;
let price = -1;
let fee = -1;

const explorerUrl = (address: string) =>
  "https://www.blockchain.com/btc/address/" + address;

console.log("[done] fetching data from APIs. Starting tests...");

before(async () => {
  [history, price, fee] = await Promise.all([
    getTxHistory(config.SATOSHI_ADDRESS),
    getUSDPrice(),
    getFee(),
  ]);
});

describe("calc transaction", () => {
  const feePerByte = 60;
  const from = getAccount(config.PHRASE_1);
  const to = getAccount(config.PHRASE_2);
  const sats = 5000;
  const result = calcTx(
    from.privateKey,
    to.address,
    sats,
    txInputs,
    feePerByte
  );

  const result2 = calcTx(
    from.privateKey,
    to.address,
    10000,
    txInputs,
    feePerByte
  );

  it("should calc a different tx and not have the same hex", () => {
    expect(result2.hex === hex).to.be.false;
  });

  it("should create an tx hex", () => {
    expect(result.hex).eq(hex);
  });

  it("should create a valid hash of the hex", () => {
    expect(hexTohashId(result.hex)).eq(hash);
  });

  it("should create an tx hash", () => {
    expect(result.hash).eq(hash);
    const str = `
    from:    ${from.address}
    to:      ${to.address}
    value:   ${sats}
    fee:     ${result.fee}
    balance: ${result.balance}
    hash:    ${result.hash}
    hex:     ${result.hex}
    `;
    console.log(str);
  });
});

describe("generating accounts from mnemonic", () => {
  it("should create account 1", () => {
    const { privateKey, address } = getAccount(config.PHRASE_1);
    expect(config.ACCOUNT_1_WIF).eq(privateKey);
    expect(config.ACCOUNT_1_ADDRESS).eq(address);
  });

  it("should create account 2", () => {
    const { privateKey, address } = getAccount(config.PHRASE_2);
    expect(config.ACCOUNT_2_WIF).eq(privateKey);
    expect(config.ACCOUNT_2_ADDRESS).eq(address);

    const str = `
      account1 = ${explorerUrl(config.ACCOUNT_1_ADDRESS)}
      account2 = ${explorerUrl(config.ACCOUNT_2_ADDRESS)}
    `;
    console.log(str);
  });
});

describe("hashing function", () => {
  it("should hash the raw genesis tx", () => {
    expect(hexTohashId(config.GENESIS_TX)).eq(config.GENESIS_HASH);
  });
});

describe("satoshi conversion", () => {
  it("Should get the correct amount of Satoshis for 1 BTC (100000000)", () => {
    expect(toSatoshi(1)).to.be.eq(100000000);
  });

  it("Should get the correct amount of BTC for 1 Satoshi (1e-8)", () => {
    expect(fromSatoshi(1)).eq(1e-8);
  });
});

describe("get dollar price and test conversion functions", () => {
  it("should fetch price of 1 BTC in USD", () => {
    expect(price).to.greaterThan(0);
    expect(Math.round(fromSatoshi(UsdToSatoshi(price, price)))).to.eq(1);
    const str = `
      1 BTC        = ${price} USD
      1 SAT        = ${satoshiToUsd(1, price)} USD
      1000 USD     = ${fromSatoshi(UsdToSatoshi(1000, price))} BTC
      1000 USD     = ${UsdToSatoshi(1000, price)} SAT

      after round coversion:

      ${price} USD = ${fromSatoshi(UsdToSatoshi(price, price))} BTC
      1 BTC        = ${satoshiToUsd(toSatoshi(1), price)} USD
      `;
    console.log(str);
  });

  it("should get the correct amount of Satoshis for 5 USD", () => {
    const satoshisInDollar = UsdToSatoshi(5, price);
    expect(satoshisInDollar).greaterThan(0);
  });
});

describe("get fee per byte", () => {
  it("should get fee per byte", () => {
    expect(fee).greaterThan(0);
    const str = `
      1 byte = ${fee} SAT
      1 MB   = ${fee * 1e6} SAT
      1 MB   = ${fromSatoshi(fee * 1e6)} BTC
      `;
    console.log(str);
  });
});

describe("account history", () => {
  it("should get Satoshi's address", () => {
    expect(history.address).eq(config.SATOSHI_ADDRESS);
  });
});
