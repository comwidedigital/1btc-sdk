import crypto from "crypto";
import * as bitcoin from "bitcoinjs-lib";
import BN from "bignumber.js";
import { constants } from "./config";

BN.config({ DECIMAL_PLACES: 10 });

export type BigNumberish = string | number | BN;
export { BN };

export const fromSatoshi = (value: BigNumberish) => {
  return new BN(value).shiftedBy(-constants.Bitcoin.decimals).toNumber();
};

export const toSatoshi = (value: BigNumberish) => {
  return new BN(value).shiftedBy(constants.Bitcoin.decimals).toNumber();
};

export const satoshiToUsd = (value: BigNumberish, usdPrice: number) => {
  const priceSatoshi = new BN(usdPrice).shiftedBy(-constants.Bitcoin.decimals);
  return priceSatoshi.times(value).toNumber();
};

export const UsdToSatoshi = (value: BigNumberish, usdPrice: number) => {
  const priceSatoshi = new BN(usdPrice).shiftedBy(-constants.Bitcoin.decimals);
  const dollar = new BN(1).div(priceSatoshi);
  return dollar.times(value).integerValue(BN.ROUND_FLOOR).toNumber();
};

export const wifToAddress = (wif: string) => {
  const pair = bitcoin.ECPair.fromWIF(wif);
  const { address } = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({
      pubkey: pair.publicKey,
      network: pair.network,
    }),
    network: pair.network,
  });
  return address || "";
};

export const wifToRedeem = (wif: string) => {
  const pair = bitcoin.ECPair.fromWIF(wif);
  const redeem = bitcoin.payments.p2wpkh({
    pubkey: pair.publicKey,
    network: pair.network,
  });
  return redeem.output as Buffer;
};

export const hexTohashId = (hex: string) => {
  const sha256 = (buffer: Buffer) =>
    crypto.createHash("SHA256").update(buffer).digest();

  const doublesha256 = (encodedTransaction: Buffer) =>
    sha256(sha256(encodedTransaction));

  return doublesha256(Buffer.from(hex, "hex")).reverse().toString("hex");
};
