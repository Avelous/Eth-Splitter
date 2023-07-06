import { Dispatch, SetStateAction } from "react";
import { GetAccountResult } from "@wagmi/core";

export type UiJsxProps = {
  splitItem: string;
  account: GetAccountResult;
  splitterContract: string;
};

export type TokenDataJsxProps = {
  splitErc20Loading: boolean;
  account: GetAccountResult;
  splitterContract: string;
  setTokenContract: Dispatch<SetStateAction<string>>;
  tokenContract: string;
};
