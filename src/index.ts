import { UsdToSatoshi } from "./utils";
import {
  calcTx,
  getAccount,
  getFee,
  getInputsFromAddress,
  getTxHistory,
  getUSDPrice,
} from "./api";
import config from "./config";

const main = async () => {
  const account1 = getAccount(config.PHRASE_1);
  const account2 = getAccount(config.PHRASE_2);
  console.log(account1, account2);

  const [feePerByte, txInputs, usdPrice] = await Promise.all([
    getFee(),
    getInputsFromAddress(account1.address),
    getUSDPrice(),
  ]);

  const dollar = UsdToSatoshi(1, usdPrice);

  const { hex, fee, hash } = calcTx(
    account1.privateKey,
    account2.address,
    Math.round(dollar * 0.25),
    txInputs,
    feePerByte
  );
  console.log({ hex, fee, hash });
  getTxHistory(account1.address);

  // const result = await broadcastTx(hex);
  // console.log(result);
};

main();
