import React, { useEffect, useState } from "react";
import { AddressInput } from "../scaffold-eth";
import { readContract } from "@wagmi/core";
import { prepareWriteContract, writeContract } from "@wagmi/core";
import { ethers } from "ethers";
import { erc20ABI } from "wagmi";
import { ExclamationCircleIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const UnEqualSplit = ({ splitItem, account, splitterContract }: { splitItem: string }) => {
  const [wallets, setWallets] = useState<string[]>([""]);
  const [amounts, setAmounts] = useState<string[]>([""]);
  const [amountsInWei, setAmountsInWei] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState("");

  const [tokenContract, setTokenContract] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenAllowance, setTokenAllowance] = useState("");
  const [tokenBalance, setTokenBalance] = useState("");
  const approveAmount = "1000000000000000000000";

  function addMultipleAddress(value: string) {
    const validateAddress = (address: string) => address.includes("0x") && address.length === 42;

    const addresses: string[] = value.trim().split(",");

    let uniqueAddresses = [...new Set([...addresses])];
    uniqueAddresses = [...new Set([...wallets.filter(validateAddress), ...uniqueAddresses])];
    setWallets(uniqueAddresses);
  }

  const addWalletField = () => {
    const newWallets = [...wallets, ""];
    setWallets(newWallets);
    const newAmounts = [...amounts, ""];
    setAmounts(newAmounts);
  };

  const removeWalletField = (index: number) => {
    const newWallets = [...wallets];
    newWallets.splice(index, 1);
    setWallets(newWallets);

    const newAmounts = [...amounts];
    newAmounts.splice(index, 1);
    setAmounts(newAmounts);
  };

  const updateWallet = (value: string, index: number) => {
    if (value.length <= 42) {
      const newWallets = [...wallets];
      newWallets[index] = value;
      setWallets(newWallets);
    }

    if (value.length > 42) {
      addMultipleAddress(value);
    }
  };

  const updateAmounts = async (value: string, index: number) => {
    const newAmounts = [...amounts];
    newAmounts[index] = value;
    setAmounts(newAmounts);
  };

  useEffect(() => {
    let totalETH = 0;
    const newAmountsInWei = [];
    for (let index = 0; index < amounts.length; index++) {
      if (amounts[index] === "") {
        return;
      }
      totalETH += parseFloat(amounts[index]);
      newAmountsInWei.push(ethers.utils.parseUnits(amounts[index].toString(), "ether"));
    }
    setAmountsInWei(newAmountsInWei);
    setTotalAmount(totalETH.toFixed(18));
  }, [amounts]);

  const { writeAsync: splitETH, isLoading: splitEthLoading } = useScaffoldContractWrite(
    "ETHSplitter",
    "splitETH",
    [wallets, amountsInWei],
    totalAmount,
  );

  const { writeAsync: splitERC20, isLoading: splitErc20Loading } = useScaffoldContractWrite(
    "ETHSplitter",
    "splitERC20",
    [tokenContract, wallets, amountsInWei],
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

      let allowance: any = await readContract({
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
      // balance = balance.toHexString();
      balance = ethers.utils.formatEther(balance, "ether");
      setTokenBalance(balance.toString());
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    for (let index = 0; index < amounts.length; index++) {
      if (wallets[index] === "" || amounts[index] === "") {
        return;
      }
    }
  }, [amounts, wallets]);

  useEffect(() => {
    if (tokenContract !== "") getTokenData();
  }, [tokenContract, splitErc20Loading]);

  return (
    <>
      {splitItem === "split-eth" && (
        <div className="mx-auto my-14">
          <form
            // onSubmit={handleTx}
            className="md:w-[500px] w-[300px] lg:w-[800px] bg-base-100 rounded-3xl shadow-xl border-2 p-2"
          >
            <div className="flex flex-col space-y-1 w-full my-1">
              <p className="font-semibold  ml-1 my-0 break-words">Recipient Wallets</p>

              {wallets.map((wallet, index) => (
                <>
                  <div key={index} className="flex gap-2 mt-5 w-full ">
                    <div className="w-11/12 flex items-center gap-2">
                      <span className="w-11/12">
                        <AddressInput
                          name={""}
                          placeholder={"Recipient's address"}
                          value={wallet}
                          onChange={val => updateWallet(val, index)}
                        />
                      </span>
                      <span className="w-4/12">
                        <input
                          className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem]  font-medium placeholder:text-accent/50 w-full text-gray-400 bg-base-200 border-2 border-base-300"
                          type="number"
                          min={0}
                          value={amounts[index]}
                          onChange={val => updateAmounts(val.target.value, index)}
                          placeholder="Amount"
                        />
                      </span>
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          removeWalletField(index);
                        }}
                      >
                        <TrashIcon className="h-1/2" />
                      </button>
                    )}
                  </div>
                  {!ethers.utils.isAddress(wallet) && wallet !== "" && (
                    <p className="ml-2 text-[0.75rem] text-red-400">address is invalid</p>
                  )}
                </>
              ))}
              <button type="button" onClick={addWalletField} className="btn btn-primary font-black ">
                <PlusIcon className="h-1/2" />
              </button>
            </div>

            <div className="my-[10px] w-full space-y-4">
              <button
                type="button"
                disabled={
                  wallets.length <= 1 ||
                  amounts.length <= 1 ||
                  amounts.length != wallets.length ||
                  amounts.includes("") ||
                  wallets.includes("") ||
                  wallets.some(wallet => !ethers.utils.isAddress(wallet))
                }
                className={`btn btn-primary w-full font-black `}
                onClick={async () => {
                  await splitETH();
                }}
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
                <p className="font-semibold  ml-1 my-0 break-words">Token Name: {tokenName}</p>
                <p className="font-semibold  ml-1 my-0 break-words ">Token Balance: {tokenBalance} </p>
                <p className="font-semibold  ml-1 my-0 break-words">Token Allowance: {tokenAllowance}</p>
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
                    }}
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto ">
            <form
              // onSubmit={handleTx}
              className="md:w-[500px] w-[300px] lg:w-[800px] bg-base-100 rounded-3xl shadow-xl border-2 p-2"
            >
              <div className="flex flex-col space-y-1 w-full my-1">
                <p className="font-semibold  ml-1 my-0 break-words">Recipient Wallets</p>

                {wallets.map((wallet, index) => (
                  <>
                    <div key={index} className="flex gap-2 mt-5 w-full ">
                      <div className="w-11/12 flex gap-2 items-center">
                        <span className="w-11/12">
                          <AddressInput
                            name={""}
                            placeholder={"Recipient's address"}
                            value={wallet}
                            onChange={val => updateWallet(val, index)}
                          />
                        </span>
                        <span className="w-4/12">
                          <input
                            className="input  input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] font-medium placeholder:text-accent/50 w-full text-gray-400 bg-base-200 border-2 border-base-300"
                            type="number"
                            min={0}
                            onChange={val => updateAmounts(val.target.value, index)}
                            placeholder="Amount"
                          />
                        </span>
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            removeWalletField(index);
                          }}
                        >
                          <TrashIcon className="h-1/2" />
                        </button>
                      )}
                    </div>
                    {!ethers.utils.isAddress(wallet) && wallet !== "" && (
                      <p className="ml-2 text-[0.75rem] text-red-400">address is invalid</p>
                    )}
                  </>
                ))}
                <button type="button" onClick={addWalletField} className="btn btn-primary font-black ">
                  <PlusIcon className="h-1/2" />
                </button>
              </div>

              <div className="my-[10px] w-full space-y-4">
                <button
                  type="button"
                  disabled={
                    wallets.length <= 1 ||
                    amounts.length <= 1 ||
                    amounts.length != wallets.length ||
                    amounts.includes("") ||
                    wallets.includes("") ||
                    wallets.some(wallet => !ethers.utils.isAddress(wallet))
                  }
                  onClick={async () => await splitERC20()}
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

export default UnEqualSplit;
