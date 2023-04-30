import React, { useState } from "react";
import { AddressInput } from "../scaffold-eth";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

const UnEqualSplit = ({ splitItem }: { splitItem: string }) => {
  const [wallets, setWallets] = useState<string[]>([""]);
  const [amounts, setAmounts] = useState<string[]>([""]);
  const [approveAmount, setApproveAmount] = useState("");
  const [tokenContract, setTokenContract] = useState("");

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

  const updateAmounts = (value: string, index: number) => {
    const newAmounts = [...amounts];
    newAmounts[index] = value;
    setAmounts(newAmounts);
  };

  const handleTx = () => {
    return;
  };

  const approve = () => {
    return;
  };

  return (
    <>
      {splitItem === "split-eth" && (
        <div className="mx-auto my-14">
          <form
            onSubmit={handleTx}
            className="md:w-[500px] w-[300px] lg:w-[800px] bg-base-100 rounded-3xl shadow-xl border-2 p-2"
          >
            <div className="flex flex-col space-y-1 w-full my-1">
              <p className="font-semibold  ml-1 my-0 break-words">Recipient Wallets</p>

              {wallets.map((wallet, index) => (
                <div key={index} className="flex gap-2 mt-5 w-full ">
                  <div className="w-11/12 flex">
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
                        className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border font-medium placeholder:text-accent/50 w-full text-gray-400"
                        type="number"
                        onChange={val => updateAmounts(val.target.value, index)}
                        placeholder="Amount"
                      />
                    </span>
                  </div>
                  {index > 0 && (
                    <button
                      onClick={() => {
                        removeWalletField(index);
                      }}
                    >
                      <TrashIcon className="h-1/2" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addWalletField} className="btn btn-primary font-black ">
                <PlusIcon className="h-1/2" />
              </button>
            </div>

            <div className="my-[10px] w-full space-y-4">
              <button
                type="button"
                className={`btn btn-primary w-full font-black `}
                onClick={async () => {
                  console.log("Submitting");
                  await handleTx();
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
                <p className="font-semibold  ml-1 my-0 break-words">Token Name: </p>
                <p className="font-semibold  ml-1 my-0 break-words">Token Allowance: </p>
                <div
                  className={`flex items-center justify-between border-2 border-base-300 bg-base-200 rounded-full text-accent w-full`}
                >
                  <input
                    type="number"
                    value={approveAmount}
                    onChange={e => setApproveAmount(e.target.value)}
                    className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-3/5 font-medium placeholder:text-accent/50 text-gray-400"
                  />
                  <button
                    type="button"
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
              onSubmit={handleTx}
              className="md:w-[500px] w-[300px] lg:w-[800px] bg-base-100 rounded-3xl shadow-xl border-2 p-2"
            >
              <div className="flex flex-col space-y-1 w-full my-1">
                <p className="font-semibold  ml-1 my-0 break-words">Recipient Wallets</p>

                {wallets.map((wallet, index) => (
                  <div key={index} className="flex gap-2 mt-5 w-full ">
                    <div className="w-11/12 flex">
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
                          className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border font-medium placeholder:text-accent/50 w-full text-gray-400"
                          type="number"
                          onChange={val => updateAmounts(val.target.value, index)}
                          placeholder="Amount"
                        />
                      </span>
                    </div>
                    {index > 0 && (
                      <button
                        onClick={() => {
                          removeWalletField(index);
                        }}
                      >
                        <TrashIcon className="h-1/2" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addWalletField} className="btn btn-primary font-black ">
                  <PlusIcon className="h-1/2" />
                </button>
              </div>

              <div className="my-[10px] w-full space-y-4">
                <button type="submit" className={`btn btn-primary w-full font-black `}>
                  Split ETH
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
