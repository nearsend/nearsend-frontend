export const INIT_UNIT_128 = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
export const INIT_UNIT_256 = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';

export const FORMAT_DECIMAL_SCALE = 8;
export const FORMAT_4_DECIMAL = 4;

export const BLOCKCHAIN_TRANSACTION_STATUS = {
  SUCCESS: 1,
};

declare type BlockHash = string;
declare type BlockHeight = number;

export type META_DATA = {
  address?: string;
  decimals?: number;
  icon?: string | null;
  name?: string;
  token?: string;
  reference?: string | null;
  reference_hash?: string | null;
  spec?: string;
  symbol?: string;
  block_height?: BlockHeight;
  block_hash?: BlockHash;
  value?: string;
};

export type META_DATA_RESPONSE = {
  result: Buffer;
  block_height: BlockHeight;
  block_hash: BlockHash;
};
