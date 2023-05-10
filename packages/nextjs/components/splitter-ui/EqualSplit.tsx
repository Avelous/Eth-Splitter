import React, { useEffect, useState } from "react";
import { readContract } from "@wagmi/core";
import { prepareWriteContract, writeContract } from "@wagmi/core";
import { ethers } from "ethers";
import { erc20ABI } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const EqualSplit = ({ splitItem, account, splitterContract }: { splitItem: string }) => {
  const [amount, setamount] = useState("");
  const [wallets, setWallets] = useState<string[]>([]);

  const [totalAmount, setTotalAmount] = useState("");
  const [tokenContract, setTokenContract] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenAllowance, setTokenAllowance] = useState("");
  const [tokenBalance, setTokenBalance] = useState("");
  const approveAmount = "1000000000000000000000";

  console.log(totalAmount);
  function addMultipleAddress(value: string) {
    const validateAddress = (address: string) => address.includes("0x") && address.length === 42;
    let addresses: string[];
    if (value.includes(",")) {
      addresses = value
        .trim()
        .split(",")
        .map(str => str.replace(/\n/g, "").replace(/\s/g, ""));
    } else {
      addresses = value
        .trim()
        .split(/\s+/)
        .map(str => str.replace(/\s/g, ""));
    }

    let uniqueAddresses = [...new Set([...addresses])];

    uniqueAddresses = uniqueAddresses.filter(validateAddress);

    setWallets(uniqueAddresses);
  }
  const { writeAsync: splitEqualETH, isLoading: splitEthLoading } = useScaffoldContractWrite(
    "ETHSplitter",
    "splitEqualETH",
    [wallets],
    totalAmount.toString(),
  );

  const { writeAsync: splitEqualERC20, isLoading: splitErc20Loading } = useScaffoldContractWrite(
    "ETHSplitter",
    "splitEqualERC20",
    [tokenContract, wallets, totalAmount.toString()],
  );

  const approve = async () => {
    try {
      const config = await prepareWriteContract({
        address: tokenContract,
        abi: erc20ABI,
        functionName: "approve",
        args: [splitterContract, approveAmount],
      });
      await writeContract(config);
      setTokenAllowance(approveAmount);
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

      let allowance = await readContract({
        address: tokenContract,
        abi: erc20ABI,
        functionName: "allowance",
        args: [account.address.toString(), splitterContract],
      });
      allowance = allowance.toHexString();
      allowance = parseInt(allowance, 16);
      setTokenAllowance(allowance.toString());

      let balance: any = await readContract({
        address: tokenContract,
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [account.address.toString()],
      });
      balance = ethers.utils.formatEther(balance, "ether");
      setTokenBalance(balance.toString());
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let totalAmount: any = 0;
    for (let index = 0; index < wallets.length; index++) {
      if (wallets[index] === "" || amount === "") {
        return;
      }
      totalAmount += parseFloat(amount);
    }
    if (splitItem === "split-tokens") totalAmount = ethers.utils.parseEther(totalAmount.toString(), "ether");
    setTotalAmount(totalAmount);
  }, [amount, wallets, splitItem]);

  useEffect(() => {
    if (tokenContract !== "") getTokenData();
  }, [tokenContract, splitErc20Loading]);

  return (
    <>
      {splitItem === "split-eth" && (
        <div className="mx-auto my-14">
          <form className="md:w-[500px] w-[300px] lg:w-[800px] bg-base-100 rounded-3xl shadow-xl border-2 p-2">
            <div className="flex flex-col space-y-1 w-full my-1">
              <p className="font-semibold  ml-1 my-0 break-words">ETH Amount Each</p>
              <div
                className={`flex items-center justify-between border-2 border-base-300 bg-base-200 rounded-full text-accent w-full`}
              >
                <input
                  type="number"
                  value={amount}
                  min={0}
                  onChange={e => setamount(e.target.value)}
                  className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400  border w-full font-medium placeholder:text-accent/50 text-gray-400"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1 w-full my-1 ">
              <p className="font-semibold  ml-1 my-0 break-words">Recipient Wallets</p>
              <div
                className={`flex items-center justify-between border-2 border-base-300 bg-base-200 rounded-xl text-accent w-full`}
              >
                <textarea
                  placeholder="Seperate each address with a comma"
                  // value={wallets}
                  onChange={e => addMultipleAddress(e.target.value)}
                  className="textarea rounded-none textarea-ghost focus:outline-none focus:bg-transparent focus:text-gray-400  min-h-[11.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400"
                />
              </div>
            </div>
            <p className="ml-2 -mt-1">valid unique addresses: {wallets.length}</p>
            <div className="my-[10px] w-full space-y-4">
              <button
                type="button"
                disabled={wallets.length <= 1 || totalAmount === 0}
                onClick={async () => {
                  await splitEqualETH();
                }}
                className={`btn btn-primary w-full font-black `}
              >
                Split ETH
              </button>
            </div>
          </form>
        </div>
      )}
      {splitItem === "split-tokens" && (
        <>
          <div className="mx-auto my-14">
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
                      approve();
                    }}
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto ">
            <form className="md:w-[500px] w-[300px] lg:w-[800px] bg-base-100 rounded-3xl shadow-xl border-2 p-2">
              <div className="flex flex-col space-y-1 w-full my-1">
                <p className="font-semibold  ml-1 my-0 break-words">Token Amount Each</p>
                <div
                  className={`flex items-center justify-between border-2 border-base-300 bg-base-200 rounded-full text-accent w-full`}
                >
                  <input
                    type="number"
                    value={amount}
                    min={0}
                    onChange={e => setamount(e.target.value)}
                    className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 border w-full font-medium placeholder:text-accent/50 text-gray-400"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-1 w-full my-1">
                <p className="font-semibold  ml-1 my-0 break-words">Recipient Wallets</p>
                <div
                  className={`flex items-center justify-between border-2 border-base-300 bg-base-200 rounded-xl text-accent w-full`}
                >
                  <textarea
                    placeholder="Seperate each address with a comma"
                    // value={wallets}
                    onChange={e => addMultipleAddress(e.target.value)}
                    className="textarea textarea-ghost rounded-none focus:outline-none focus:bg-transparent focus:text-gray-400  min-h-[11.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400"
                  />
                </div>
              </div>
              <p className="ml-2 -mt-1">valid unique addresses: {wallets.length}</p>
              <div className="my-[10px] w-full space-y-4">
                <button
                  type="button"
                  disabled={wallets.length <= 1 || totalAmount == 0}
                  onClick={async () => await splitEqualERC20()}
                  className={`btn btn-primary w-full font-black `}
                >
                  Split TOKENS
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default EqualSplit;
