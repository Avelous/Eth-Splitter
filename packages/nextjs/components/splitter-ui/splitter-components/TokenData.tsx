import React, { useEffect, useState } from "react";
import { readContract } from "@wagmi/core";
import { prepareWriteContract, writeContract } from "@wagmi/core";
import { ethers } from "ethers";
import { erc20ABI } from "wagmi";

const TokenData = ({ splitErc20Loading, account, splitterContract, setTokenContract, tokenContract }: { splitErc20Loading: boolean }) => {

  const [tokenName, setTokenName] = useState("");
  const [tokenAllowance, setTokenAllowance] = useState("");
  const [tokenBalance, setTokenBalance] = useState("");
  const approveAmount = "1000000000000000000000";

  const approve = async () => {
    try {
      const config = await prepareWriteContract({
        address: tokenContract,
        abi: erc20ABI,
        functionName: "approve",
        args: [splitterContract, approveAmount],
      });
      await writeContract(config);
    } catch (error) {
      console.log(error);
    }
  };

  const getTokenData = async () => {
    try {
      const name = await readContract({
        address: tokenContract,
        abi: erc20ABI,
        functionName: "name",
      });
      setTokenName(name);
      console.log(splitterContract);
      let allowance = await readContract({
        address: tokenContract,
        abi: erc20ABI,
        functionName: "allowance",
        args: [account.address.toString(), splitterContract],
      });
      allowance = allowance.toHexString();
      allowance = parseInt(allowance, 16);
      setTokenAllowance(allowance.toLocaleString());

      let balance: any = await readContract({
        address: tokenContract,
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [account.address.toString()],
      });
      balance = ethers.utils.formatEther(balance, "ether");
      setTokenBalance(balance.toLocaleString());
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tokenContract !== "") getTokenData();
  }, [tokenContract, splitErc20Loading]);

  return (
    <div className="mx-auto my-14 -mb-2">
      <div className="md:w-[500px] w-[300px] lg:w-[800px] bg-base-100 rounded-3xl shadow-xl border-2 p-2">
        <div className="flex flex-col space-y-1 w-full my-1">
          <p className="font-semibold  ml-1 my-0 break-words">Enter Token Contract</p>
          <div
            className={`flex items-center justify-between border-2 border-base-300 bg-base-200 rounded-full text-accent w-full`}
          >
            <input
              type="text"
              value={tokenContract}
              onChange={e => setTokenContract(e.target.value)}
              className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400  border w-full font-medium placeholder:text-accent/50 text-gray-400"
            />
          </div>
        </div>
        <div className="flex flex-col space-y-1 w-full my-1">
          <p className="font-semibold  ml-1 my-0 break-words">Token Name: {tokenName} </p>
          <p className="font-semibold  ml-1 my-0 break-words ">Token Balance: {tokenBalance} </p>
          <p className="font-semibold  ml-1 my-0 break-words ">Token Allowance: {tokenAllowance} </p>
          <div
            className={`flex items-center justify-between border-2 border-base-300 bg-base-200 rounded-full text-accent w-full`}
          >
            <input
              type="number"
              value={approveAmount}
              readOnly
              // onChange={e => setApproveAmount(e.target.value)}
              className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-3/5 font-medium placeholder:text-accent/50 text-gray-400"
            />
            <button
              type="button"
              disabled={tokenContract == "" || tokenName == ""}
              className={`btn btn-primary w-2/5 font-black `}
              onClick={async () => {
                await approve();
                getTokenData();
              }}
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenData;
