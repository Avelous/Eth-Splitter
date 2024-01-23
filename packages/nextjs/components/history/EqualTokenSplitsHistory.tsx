import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Address } from "../scaffold-eth";
import ExportList from "../splitter-ui/splitter-components/ExportList";
import { formatEther } from "viem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import useSpliiterHistory from "~~/hooks/useSpliiterHistory";
import { getBlockExplorerTxLink, getTargetNetwork } from "~~/utils/scaffold-eth";
import { getDate } from "~~/utils/scaffold-eth/ethsplitter";

const EqualTokenSplitsHistory = () => {
  const router = useRouter();
  const { erc20SplitEqualEvents } = useSpliiterHistory();
  const [activeIndex, setActiveIndex] = useState<number[]>([]);

  const handleToggle = (index: number) => {
    const currentActive = [...activeIndex];

    if (currentActive.includes(index)) {
      const indexToRemove = currentActive.indexOf(index);
      currentActive.splice(indexToRemove, 1);
    } else {
      currentActive.push(index);
    }
    setActiveIndex(currentActive);
  };

  const repeatSplit = (wallets: string[], amount: number, tokenAddress: string) => {
    router.push({
      pathname: `/`,
      query: {
        activeSplitToken: "split-tokens",
        activeSplitType: "equal-splits",
        wallets: wallets,
        amount: amount,
        tokenAddress: tokenAddress,
      },
    });
  };

  return (
    <div>
      {erc20SplitEqualEvents?.map((event, index) => (
        <div key={index} className={"flex flex-col  my-1 hover:border-yellow-500  border"}>
          <div
            className="flex flex-wrap items-center py-2 justify-between cursor-pointer bg-base-300 px-4"
            onClick={() => handleToggle(index)}
          >
            <span className="w-[40%]">Equal Split</span>
            <span className="w-[30%] ">{Number(formatEther(event.args.totalAmount)) + " " + event.tokenSymbol}</span>
            <span className="w-[30%] flex justify-center">{getDate(event.block.timestamp)}</span>
          </div>
          {activeIndex.includes(index) && (
            <div className=" px-4 py-6 grid lg:grid-cols-6 gap-2 text-sm grid-cols-3 ">
              <div>
                <span>recipients (address[]):</span>
                <ExportList wallets={event.args.recipients} />
              </div>
              <div className="flex flex-col">
                [
                {event.args.recipients.map((address: string) => (
                  <Address key={address} address={address} hideBlockie={true} />
                ))}
                ]
              </div>
              <span>totalAmount (uint256): {Number(event.args.totalAmount)}</span>

              <span className="py-1">token (address):</span>
              <div>
                <Address address={event.args.token} hideBlockie={true} />
              </div>
              {event.log.transactionHash && (
                <div>
                  <div className="flex gap-2 items-center h-fit border-t pt-2">
                    <span>Transaction Link</span>
                    <span className="">
                      <Link
                        href={getBlockExplorerTxLink(getTargetNetwork().id, event.log.transactionHash)}
                        target="_blank"
                      >
                        <ArrowTopRightOnSquareIcon className="text-sm w-4 cursor-pointer" aria-hidden="true" />
                      </Link>
                    </span>
                  </div>
                  <button
                    className="btn btn-primary btn-sm mt-2"
                    onClick={() =>
                      repeatSplit(
                        event.args.recipients,
                        Number(formatEther(event.args.totalAmount)) / event.args.recipients.length,
                        event.args.token,
                      )
                    }
                  >
                    Repeat
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EqualTokenSplitsHistory;
