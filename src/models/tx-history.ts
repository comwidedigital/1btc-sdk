export interface SpendingOutpoint {
  tx_index: number;
  n: number;
}

export interface PrevOut {
  spent: boolean;
  spending_outpoints: SpendingOutpoint[];
  tx_index: number;
  type: number;
  addr: string;
  value: any;
  n: number;
  script: string;
}

export interface Input {
  sequence: any;
  witness: string;
  prev_out: PrevOut;
  script: string;
}

export interface SpendingOutpoint2 {
  tx_index: number;
  n: number;
}

export interface Out {
  spent: boolean;
  spending_outpoints: SpendingOutpoint2[];
  tx_index: number;
  type: number;
  addr: string;
  value: any;
  n: number;
  script: string;
}

export interface Tx {
  ver: number;
  inputs: Input[];
  weight: number;
  block_height: number;
  relayed_by: string;
  out: Out[];
  lock_time: number;
  result: number;
  size: number;
  block_index: number;
  time: number;
  tx_index: number;
  vin_sz: number;
  hash: string;
  vout_sz: number;
}

export interface TxHistory {
  hash160: string;
  address: string;
  n_tx: number;
  total_received: number;
  total_sent: number;
  final_balance: number;
  txs: Tx[];
}
