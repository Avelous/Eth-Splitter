import { useEffect, useState } from "react";
import { prepareWriteContract, readContract, writeContract } from "@wagmi/core";
import { formatEther } from "viem";
import { erc20ABI, useAccount, useNetwork } from "wagmi";
import { getParsedError } from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
// import { useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";

export const useApproveForSplitting = ({
  tokenAddress,
  amount,
  isTransferLoading,
}: {
  tokenAddress: string;
  amount: number;
  isTransferLoading?: boolean;
}) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const writeTx = useTransactor();
  const [isMining, setIsMining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const configuredNetwork = getTargetNetwork();
  const { data: deployedContract } = useDeployedContractInfo("ETHSplitter");

  const [allowance, setAllowance] = useState<number>();
  const [balance, setBalance] = useState<number>();
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenName, setTokenName] = useState("");

  const [updateAllowance, setUpdateAllowance] = useState(false);

  const sendContractWriteTx = async () => {
    if (!chain?.id) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== configuredNetwork.id) {
      notification.error("You on the wrong network");
      return;
    }

    if (deployedContract && tokenAddress) {
      const config = await prepareWriteContract({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: "approve",
        args: [deployedContract?.address, BigInt(amount * 1.01 * 1000000000000000000)],
      });

      try {
        setIsMining(true);
        await writeTx(() => writeContract(config));
        setUpdateAllowance(true);
      } catch (e: any) {
        const message = getParsedError(e);
        notification.error(message);
      } finally {
        setIsMining(false);
      }
    } else {
      notification.error("Contract writer error. Try again.");
      return;
    }
  };

  useEffect(() => {
    (async () => {
      if (tokenAddress && tokenAddress != "" && address && deployedContract && !isTransferLoading) {
        setAllowance(undefined);
        setIsLoading(true);
        try {
          const data = await readContract({
            address: tokenAddress,
            abi: erc20ABI,
            functionName: "allowance",
            args: [address, deployedContract.address],
          });
          setAllowance(parseInt(formatEther(data)));
        } catch (error) {
          setAllowance(undefined);
        }
      }
      if (updateAllowance) setUpdateAllowance(false);
      setIsLoading(false);
    })();
  }, [tokenAddress, address, deployedContract, isMining, updateAllowance, isTransferLoading]);

  useEffect(() => {
    (async () => {
      if (tokenAddress && tokenAddress != "" && address && !isTransferLoading) {
        setIsLoading(true);
        setBalance(undefined);
        try {
          const data = await readContract({
            address: tokenAddress,
            abi: erc20ABI,
            functionName: "balanceOf",
            args: [address],
          });
          setBalance(parseFloat(formatEther(data)));
        } catch (error) {
          setBalance(undefined);
        }
      }
    })();
    setIsLoading(false);
  }, [tokenAddress, address, deployedContract, isMining, isTransferLoading]);

  useEffect(() => {
    (async () => {
      if (tokenAddress && tokenAddress != "" && address && !isTransferLoading) {
        setTokenSymbol("");
        setTokenName("");
        setIsLoading(true);
        try {
          const symbol = await readContract({
            address: tokenAddress,
            abi: erc20ABI,
            functionName: "symbol",
          });
          setTokenSymbol(symbol);

          const name = await readContract({
            address: tokenAddress,
            abi: erc20ABI,
            functionName: "name",
          });
          setTokenName(name);
        } catch (error) {
          setTokenSymbol("");
          setTokenName("");
        }
      }
      setIsLoading(false);
    })();
  }, [tokenAddress, address, deployedContract, isMining, isTransferLoading]);

  return {
    isMining,
    writeAsync: sendContractWriteTx,
    allowance: allowance,
    balance: balance,
    tokenSymbol: tokenSymbol,
    tokenName: tokenName,
    isLoading,
  };
};
