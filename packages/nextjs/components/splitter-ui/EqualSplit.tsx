import React, { useState } from "react";

const EqualSplit = ({ splitItem }: { splitItem: string }) => {
  const [amount, setamount] = useState("");
  const [wallets, setWallets] = useState<string[]>([]);
  const [approveAmount, setApproveAmount] = useState("");
  const [tokenContract, setTokenContract] = useState("");

  function addMultipleAddress(value: string) {
    const validateAddress = (address: string) => address.includes("0x") && address.length === 42;

    const addresses: string[] = value.trim().split(",");

    let uniqueAddresses = [...new Set([...addresses])];

    uniqueAddresses = uniqueAddresses.filter(validateAddress);

    setWallets(uniqueAddresses);
  }

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
              <p className="font-semibold  ml-1 my-0 break-words">ETH Amount Each</p>
              <div
                className={`flex items-center justify-between border-2 border-base-300 bg-base-200 rounded-full text-accent w-full`}
              >
                <input
                  type="number"
                  value={amount}
                  onChange={e => setamount(e.target.value)}
                  className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400  border w-full font-medium placeholder:text-accent/50 text-gray-400"
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
                  value={wallets}
                  onChange={e => addMultipleAddress(e.target.value)}
                  className="textarea textarea-ghost focus:outline-none focus:bg-transparent focus:text-gray-400  min-h-[7.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400"
                />
              </div>
            </div>
            <div className="my-[10px] w-full space-y-4">
              <button type="submit" className={`btn btn-primary w-full font-black `}>
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
                <p className="font-semibold  ml-1 my-0 break-words ">Token Allowance: </p>
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
            <form
              onSubmit={handleTx}
              className="md:w-[500px] w-[300px] lg:w-[800px] bg-base-100 rounded-3xl shadow-xl border-2 p-2"
            >
              <div className="flex flex-col space-y-1 w-full my-1">
                <p className="font-semibold  ml-1 my-0 break-words">Token Amount Each</p>
                <div
                  className={`flex items-center justify-between border-2 border-base-300 bg-base-200 rounded-full text-accent w-full`}
                >
                  <input
                    type="number"
                    value={amount}
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
                    value={wallets}
                    onChange={e => addMultipleAddress(e.target.value)}
                    className="textarea textarea-ghost focus:outline-none focus:bg-transparent focus:text-gray-400  min-h-[7.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400"
                  />
                </div>
              </div>
              <div className="my-[10px] w-full space-y-4">
                <button type="submit" className={`btn btn-primary w-full font-black `}>
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
