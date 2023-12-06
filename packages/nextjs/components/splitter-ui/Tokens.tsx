import { useState } from "react";
import Link from "next/link";
import SpliEth from "./splitter-components/Splitter";
import { useAccount } from "wagmi";
import { useNetwork } from "wagmi";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import useTokenBalances from "~~/hooks/useTokenBalances";
import { getBlockExplorerAddressLink, getTargetNetwork } from "~~/utils/scaffold-eth";

const Tokens = () => {
  const { tokenBalances, loading } = useTokenBalances();
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [contractAddr, setContractAddr] = useState("");

  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  const formatTokenBalance = (balance: bigint, decimals: number) => {
    const divisor = BigInt(Math.pow(10, decimals));
    const integerPart = balance / divisor;
    const fractionalPart = balance % divisor;
    return `${integerPart}.${fractionalPart.toString().padStart(decimals, "0").slice(0, 4)}`;
  };

  const isNativeCurrency = (symbol: string) => {
    if (symbol == "ETH") {
      return true;
    } else if (chain?.id == 137 && symbol == "MATIC") {
      return true;
    }
    return false;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between">
        <h1 className="font-bold font-typo-round tracking-wide ">TOKENS</h1>
        <button
          onClick={() => {
            setIsCustom(true);
            setContractAddr("");
            setIsOpen(true);
          }}
          className="btn btn-secondary btn-sm"
        >
          Custom Token
        </button>
      </div>
      {isConnected &&
        loading &&
        Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse flex justify-between py-4">
            <div className="rounded-md bg-slate-300 h-6 w-full"></div>
          </div>
        ))}
      {tokenBalances.length > 0 && (
        <div className="mt-5">
          <table className="table bg-secondary overflow-hidden">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Balance</th>
                <th>Value</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tokenBalances.map((token, index) => (
                <tr key={index} className="group hover:bg-primary m-1 h-12">
                  <td className="w-[25%] sm-[w-50%]">
                    <div className="flex gap-1 items-center">
                      <span> {`${token.contract_ticker_symbol}`}</span>
                      {!isNativeCurrency(token.contract_ticker_symbol) && (
                        <span>
                          <Link
                            href={getBlockExplorerAddressLink(getTargetNetwork(), token.contract_address)}
                            target="_blank"
                          >
                            <ArrowTopRightOnSquareIcon className="text-sm  w-4 cursor-pointer" aria-hidden="true" />
                          </Link>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="w-[40%] sm-[w-20%]">{formatTokenBalance(token.balance, token.contract_decimals)}</td>
                  <td className="w-[20%] sm-[w-15%]">${token.quote?.toFixed(2) || "0"}</td>
                  <td className="sm:hidden group-hover:table-cell [w-15%]">
                    <button
                      className="btn btn-xs rounded-sm btn-secondary"
                      onClick={() => {
                        const symbol = token.contract_ticker_symbol;
                        setSymbol(symbol);
                        isNativeCurrency(symbol) ? setContractAddr("") : setContractAddr(token.contract_address);
                        setIsCustom(false);
                        setIsOpen(true);
                      }}
                    >
                      Split
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tokenBalances.length == 0 && !loading && (
        <div className="flex justify-center gap-1 mt-5">
          <InformationCircleIcon className="text-sm w-5 cursor-pointer" aria-hidden="true" />
          {isConnected ? "No Tokens Found" : "Connect your Wallet"}
        </div>
      )}
      {isOpen && isConnected && (
        <SpliEth
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          isToken={!isNativeCurrency(symbol)}
          contractAddr={!isNativeCurrency(symbol) ? contractAddr : ""}
          symbol={symbol}
          isCustom={isCustom}
          setContractAddr={setContractAddr}
          setSymbol={setSymbol}
        />
      )}
    </div>
  );
};

export default Tokens;
