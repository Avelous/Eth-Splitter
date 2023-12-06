import React, { useState } from "react";
import Link from "next/link";
import { Address } from "../../scaffold-eth";
import { formatEther } from "viem";
import { useNetwork } from "wagmi";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import useSpliiterHistory from "~~/hooks/useSpliiterHistory";
import { getBlockExplorerTxLink, getTargetNetwork } from "~~/utils/scaffold-eth";
import { getDate } from "~~/utils/scaffold-eth/ethsplitter";

const EthSplitsHistory = () => {
  const { ethSplitEvents } = useSpliiterHistory();
  const [activeIndex, setActiveIndex] = useState<number[]>([]);

  const { chain } = useNetwork();

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

  const currencySymbol = () => {
    return chain?.id == 137 ? "MATIC" : "ETH";
  };

  return (
    <div>
      {ethSplitEvents?.map((event, index) => (
        <div key={index} className={"flex flex-col  my-1  hover:border-yellow-500 rounded-md overflow-hidden border"}>
          <div
            className="flex flex-wrap items-center py-2 justify-between cursor-pointer bg-base-300 px-4"
            onClick={() => handleToggle(index)}
          >
            <span className="w-[40%]">Unequal Split</span>
            <span className="w-[30%] ">{Number(formatEther(event.args.totalAmount)) + " " + currencySymbol()}</span>
            <span className="w-[30%] flex justify-center">{getDate(event.block.timestamp)}</span>
          </div>
          {activeIndex.includes(index) && (
            <div className="px-4 py-6 flex gap-8 md:flex-row flex-col text-sm">
              <div className="flex gap-4 ">
                <span>recipients (address[]):</span>
                <div className="flex flex-col">
                  [
                  {event.args.recipients.map((address: string) => (
                    <Address key={address} address={address} hideBlockie={true} />
                  ))}
                  ]
                </div>
              </div>
              <div className="flex gap-4 ">
                <span>amounts (uint256[])</span>
                <div className="flex flex-col">
                  [
                  {event.args.amounts.map((amount: string) => (
                    <span key={amount}>{Number(amount)}</span>
                  ))}
                  ]
                </div>
              </div>

              {event.log.transactionHash && (
                <div className="flex gap-2 items-center h-fit ">
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
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EthSplitsHistory;
