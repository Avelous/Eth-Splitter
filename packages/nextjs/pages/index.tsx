import { useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import EqualUi from "~~/components/splitter-ui/EqualUi";
import UnEqualUi from "~~/components/splitter-ui/UnEqualUi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const [activeItem, setActiveItem] = useState("split-eth");
  const [splitType, setSplitType] = useState("");
  const account = useAccount();

  function handleItemClick(itemId: string) {
    setActiveItem(itemId);
  }

  let splitterContract: any;
  let splitterAbi: any;

  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("ETHSplitter");
  if (deployedContractData) {
    ({ address: splitterContract, abi: splitterAbi } = deployedContractData);
  }

  return (
    <>
      <Head>
        <title>ETH & Token Splitter</title>
        <meta name="description" content="Created with 🏗 scaffold-eth-2" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10">
        <ul className="menu menu-horizontal bg-base-300 rounded-full ">
          <li onClick={() => handleItemClick("split-eth")}>
            <a className={activeItem === "split-eth" ? "active" : ""}>Split ETH</a>
          </li>
          <li onClick={() => handleItemClick("split-tokens")}>
            <a className={activeItem === "split-tokens" ? "active" : ""}>Split Tokens</a>
          </li>
        </ul>

        <select
          defaultValue="select"
          className="select select-bordered w-full max-w-xs border-base-300 focus:border-none mt-4"
          onChange={e => setSplitType(e.target.value)}
        >
          <option value="select" disabled>
            Select Split Type
          </option>
          <option value="equal-splits">Equal Splits</option>
          <option value="unequal-splits">Unequal Splits</option>
        </select>
        {splitType === "equal-splits" && (
          <EqualUi splitItem={activeItem} account={account} splitterContract={splitterContract} />
        )}
        {splitType === "unequal-splits" && (
          <UnEqualUi splitItem={activeItem} account={account} splitterContract={splitterContract} />
        )}
      </div>
    </>
  );
};

export default Home;
