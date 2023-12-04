import { useEffect, useState } from "react";
import { CovalentClient } from "@covalenthq/client-sdk";
import { useAccount, useNetwork } from "wagmi";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { getChainNameForCovalent } from "~~/utils/scaffold-eth/ethsplitter";

const useTokenBalances = () => {
  const client = new CovalentClient(process.env.NEXT_PUBLIC_COVALENT_API_KEY as string);

  const [tokenBalances, setTokenBalances] = useState<any[]>([]);
  const { address } = useAccount();
  const configuredNetwork = getTargetNetwork();
  const [loading, setLoading] = useState(true);

  const { chain } = useNetwork();

  const getTokens = async () => {
    const res = await client.BalanceService.getTokenBalancesForWalletAddress(
      getChainNameForCovalent(configuredNetwork.id),
      address as string,
      {
        nft: false,
        noSpam: true,
      },
    );
    if (res.data && res.data.items) {
      const filteredTokens = res.data.items ? res.data.items.filter(token => token.quote !== 0) : [];
      setTokenBalances(filteredTokens);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    setTokenBalances([]);
    getTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chain]);

  return {
    loading: loading,
    tokenBalances,
  };
};

export default useTokenBalances;
