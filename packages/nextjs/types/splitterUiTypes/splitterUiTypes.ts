import { Dispatch, SetStateAction } from "react";

export type SplitterProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isToken: boolean;
  contractAddr: string;
  symbol: string;
  isCustom: boolean;
  setContractAddr: Dispatch<SetStateAction<string>>;
  setSymbol: Dispatch<SetStateAction<string>>;
};
