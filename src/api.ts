import { hexTohashId, wifToAddress, wifToRedeem } from "./utils";
import axios from "axios";
import { TxHistory } from "./models/tx-history";
import * as bitcoin from "bitcoinjs-lib";
import { TxInput, TxUnspent, UnspentOutput } from "./models/tx-unspent";
import * as bip39 from "bip39";
import * as bip32 from "bip32";

export const getTxHistory = async (address: string) => {
  const url = `https://blockchain.info/address/${address}?format=json`;
  const { data } = await axios.get<TxHistory>(url);
  return data;
};

export const getAccount = (phrase: string, path = "m/44'/0'/0'/0/0") => {
  const mnemonic = phrase || bip39.generateMnemonic();
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const child = root.derivePath(path);
  const privateKey = child.toWIF();
  const address = wifToAddress(privateKey);

  const accountInfo = {
    address,
    privateKey,
    mnemonic,
    path,
  };
  return accountInfo;
};

export const calcTx = (
  wif: string,
  to: string,
  value: number,
  txInputs: TxInput[],
  feePerByte: number
) => {
  const tx = new bitcoin.Psbt();
  const key = bitcoin.ECPair.fromWIF(wif);
  const address = wifToAddress(wif);
  const redeemScript = wifToRedeem(wif);
  const balance = txInputs.reduce((a, b) => a + b.value, 0);

  txInputs.forEach((input) =>
    tx.addInput({
      ...input,
      redeemScript,
      nonWitnessUtxo: Buffer.from(input.nonWitnessUtxo, "hex"),
    })
  );

  tx.addOutput({
    address: to,
    value,
  });

  const fee = feePerByte * tx.toBuffer().byteLength - 15000;

  tx.addOutput({
    address,
    value: balance - value - fee,
  });

  tx.signInput(0, key);
  tx.validateSignaturesOfInput(0);
  tx.finalizeAllInputs();
  const hex = tx.extractTransaction().toHex();
  const hash = hexTohashId(hex);

  if (balance < value + fee)
    throw "You do not have enough satoshis available to send this transaction.";

  return { balance, to, address, hex, fee, hash };
};

export const getFee = async () => {
  interface FeeResponse {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
  }
  const url = "https://bitcoinfees.earn.com/api/v1/fees/recommended";
  const { data } = await axios.get<FeeResponse>(url);
  return data.halfHourFee;
};

export const getUnspent = async (address: string) => {
  const url = `https://blockchain.info/unspent?active=${address}`;
  const { data } = await axios.get<TxUnspent>(url);
  return data;
};

export const getUSDPrice = async () => {
  interface USDPriceResponse {
    USD: {
      "15m": number;
    };
  }
  const url = "https://blockchain.info/ticker";
  const { data } = await axios.get<USDPriceResponse>(url);
  const price = data.USD["15m"];
  return price;
};

export const getInputs = async (utxos: UnspentOutput[]): Promise<TxInput[]> => {
  const getInput = async (utxo: UnspentOutput) => {
    const url = `https://blockchain.info/rawtx/${utxo.tx_hash_big_endian}?cors=true&format=hex`;
    const { data } = await axios.get(url);
    const input: TxInput = {
      hash: utxo.tx_hash_big_endian,
      index: utxo.tx_output_n,
      nonWitnessUtxo: data,
      value: utxo.value,
    };
    return input;
  };
  const inputs = await Promise.all(utxos.map(getInput));
  return inputs;
};

export const getInputsFromAddress = async (
  address: string
): Promise<TxInput[]> => {
  const utxos = (await getUnspent(address)).unspent_outputs;
  const inputs = await getInputs(utxos);
  return inputs;
};

export const broadcastTx = async (hex: string) => {
  const url = `https://blockchain.info/pushtx?cors=true&tx=${hex}`;
  const res = await axios.post<string>(url);
  const msg = res.data || "Something went wrong";
  const hash = hexTohashId(hex);
  const { status, statusText } = res;

  return {
    msg,
    hash,
    status,
    statusText,
  };
};
