import React, { useEffect, useState } from "react";
import { AddressInput } from "../../scaffold-eth";
import { parseEther, parseUnits } from "viem";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useAccountBalance } from "~~/hooks/scaffold-eth";
import { useApproveForSplitting } from "~~/hooks/useApproveForSplitting";
import { SplitterProps } from "~~/types/splitterUiTypes/splitterUiTypes";

const Splitter = ({
  isOpen,
  setIsOpen,
  isToken,
  contractAddr,
  symbol,
  isCustom,
  setContractAddr,
  setSymbol,
}: SplitterProps) => {
  const [amount, setamount] = useState("");
  const [wallets, setWallets] = useState<string[]>([]);

  const [totalAmount, setTotalAmount] = useState("");
  const [totalEthAmount, setTotalEthAmount] = useState("");
  const [totalTokenAmount, setTotalTokenAmount] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [amounts, setAmounts] = useState<string[]>([""]);
  const [amountsInWei, setAmountsInWei] = useState<any[]>([]);

  const { address } = useAccount();
  const { balance: ethBalance } = useAccountBalance(address);

  console.log(symbol);
  console.log(isToken);

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
  const { writeAsync: splitEqualETH } = useScaffoldContractWrite({
    contractName: "ETHSplitter",
    functionName: "splitEqualETH",
    args: [wallets],
    value: isToken ? "0" : (totalEthAmount.toString() as `${number}`),
  });

  const { writeAsync: splitETH } = useScaffoldContractWrite({
    contractName: "ETHSplitter",
    functionName: "splitETH",
    args: [wallets, amountsInWei],
    value: isToken ? "0" : (totalAmount as `${number}`),
  });

  const { writeAsync: splitEqualERC20, isMining: splitEqualErc20Loading } = useScaffoldContractWrite({
    contractName: "ETHSplitter",
    functionName: "splitEqualERC20",
    args: [contractAddr, wallets, BigInt(totalTokenAmount)],
  });

  const { writeAsync: splitERC20, isMining: splitErc20Loading } = useScaffoldContractWrite({
    contractName: "ETHSplitter",
    functionName: "splitERC20",
    args: [contractAddr, wallets, amountsInWei],
  });

  const {
    allowance,
    writeAsync: approve,
    balance,
    tokenSymbol,
  } = useApproveForSplitting({
    tokenAddress: contractAddr,
    amount: Number(totalAmount),
    isTransferLoading: splitEqualErc20Loading || splitErc20Loading,
  });

  const handleTx = async () => {
    if (isToken) {
      if (typeof allowance !== "undefined" && allowance < parseFloat(totalAmount)) {
        approve();
        return;
      }
      splitType == "equal" ? splitEqualERC20() : splitERC20();
    } else {
      splitType == "equal" ? splitEqualETH() : splitETH();
    }
  };

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

  const closePopup = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopup();
      }
    };

    const handleOverlayClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains("bg-gray-900")) {
        closePopup();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.addEventListener("mousedown", handleOverlayClick);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("mousedown", handleOverlayClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    let totalAmount: any = 0;
    for (let index = 0; index < wallets.length; index++) {
      if (wallets[index] === "" || amount === "") {
        return;
      }
      totalAmount += parseFloat(amount);
    }
    if (isToken) {
      totalAmount = parseEther(totalAmount.toFixed(18));
      setTotalTokenAmount(totalAmount);
    } else {
      totalAmount = totalAmount.toFixed(18);
      setTotalEthAmount(totalAmount);
    }
    setTotalAmount(totalAmount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, wallets]);

  useEffect(() => {
    let totalETH = 0;
    const newAmountsInWei = [];
    for (let index = 0; index < amounts.length; index++) {
      if (amounts[index] === "") {
        return;
      }
      totalETH += parseFloat(amounts[index]);
      newAmountsInWei.push(parseUnits(amounts[index].toString(), 18));
    }
    setAmountsInWei(newAmountsInWei);
    setTotalAmount(totalETH.toFixed(18));
  }, [amounts]);

  useEffect(() => {
    if (isCustom) {
      setSymbol(tokenSymbol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenSymbol]);

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 md:text-base text-[0.8rem] ">
        <form className=" modal-box max-w-2xl">
          <label onClick={closePopup} className="btn btn-sm btn-circle absolute right-4 top-4">
            ✕
          </label>

          <ul className="menu menu-horizontal bg-base-100 rounded-box activemenu p-0 absolute left-4 top-4">
            <li
              onClick={() => {
                setSplitType("equal");
                setWallets([]);
              }}
            >
              <a className={splitType === "equal" ? "active" : "bg-base-300"}>EQUAL</a>
            </li>
            <li
              onClick={() => {
                setSplitType("unequal");

                if (wallets.length == 0) setWallets([""]);
              }}
            >
              <a className={splitType === "unequal" ? "active" : "bg-base-300"}>UNEQUAL</a>
            </li>
          </ul>

          <div className="absolute flex inset-x-0 top-6 justify-center font-bold text-lg -z-10">
            <span>SPLIT {symbol}</span>
          </div>
          <p className="mt-12">Balance: {isToken ? balance + " " + symbol : ethBalance + " ETH"}</p>

          {isCustom && (
            <div className="flex flex-col space-y-1 w-full my-1">
              <p className="font-semibold  ml-1 my-0 break-words">Enter Token Contract</p>
              <div
                className={`flex items-center justify-between border-2 border-base-300 bg-base-200 rounded-full text-accent w-full`}
              >
                <input
                  type="text"
                  value={contractAddr}
                  onChange={e => setContractAddr(e.target.value)}
                  className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400  border w-full font-medium placeholder:text-accent/50 text-gray-400"
                />
              </div>
            </div>
          )}
          {splitType == "equal" && (
            <div>
              <div className="flex flex-col space-y-1 w-full ">
                <p className="font-semibold  ml-1 my-0 break-words">Amount</p>
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
                <p className="font-semibold ml-1 my-0 break-words">Recipient Wallets</p>
                <div
                  className={`flex items-center justify-between border-2 border-base-300 bg-base-200 rounded-xl text-accent w-full`}
                >
                  <textarea
                    placeholder="Seperate each address with a comma, space or new line"
                    onChange={e => addMultipleAddress(e.target.value)}
                    className="textarea rounded-none textarea-ghost focus:outline-none focus:bg-transparent focus:text-gray-400  min-h-[11.2rem] border w-full font-medium placeholder:text-accent text-gray-400"
                  />
                </div>
              </div>
              <p className="ml-2 -mt-1">valid unique addresses: {wallets.length}</p>
            </div>
          )}
          {splitType == "unequal" && (
            <div className="flex flex-col space-y-1 w-full ">
              <p className="font-semibold  ml-1 my-0 break-words">Recipient Wallets</p>

              {wallets.map((wallet, index) => (
                <div key={index}>
                  <div className="flex gap-2 my-2 w-full ">
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
                  {!isAddress(wallet) && wallet !== "" && (
                    <span className="ml-2 text-[0.75rem] text-red-400">address is invalid</span>
                  )}
                </div>
              ))}
              <button type="button" onClick={addWalletField} className="btn btn-primary font-black ">
                <PlusIcon className="h-1/2" />
              </button>
            </div>
          )}

          <div className="my-[10px] w-full space-y-4">
            <button
              type="button"
              disabled={wallets.length <= 1 || totalAmount === "0"}
              onClick={async () => {
                handleTx();
              }}
              className={`btn btn-primary w-full font-black `}
            >
              {isToken && typeof allowance !== "undefined" && allowance < Number(totalAmount) ? "Approve" : "Split"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Splitter;
