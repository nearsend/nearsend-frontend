import { ExecutionOutcomeWithIdView } from 'near-api-js/lib/providers/provider';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers';

export interface ResponseGenerator {
  config?: any;
  data?: any;
  headers?: any;
  request?: any;
  status?: number;
  statusText?: string;
  meta?: any;
}

export type FTMetadataResponse = {
  jsonrpc: string;
  id: string;
  result: {
    block_hash: string;
    block_height: number;
    logs: Array<any>;
    result: number[];
  };
};
export type FTMetadata = {
  decimals: number;
  name: string;
  symbol: string;
};
export type OptionSelect = {
  name: string;
  value: string;
};

export interface FinalExecutionOutcomeExtended extends FinalExecutionOutcome {
  receipts: any[];
}

export interface ExecutionOutcomeWithIdExtended extends ExecutionOutcomeWithIdView {
  hash: string;
}
