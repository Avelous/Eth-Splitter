import Head from "next/head";
import type { NextPage } from "next";
import History from "~~/components/splitter-ui/History";
import Tokens from "~~/components/splitter-ui/Tokens";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>ETH & Token Splitter</title>
        <meta name="description" content="Created with 🏗 scaffold-eth-2" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10 gap-4 xs:w-4/5 lg:max-w-5xl w-11/12">
        <Tokens />
        <History />
      </div>
    </>
  );
};

export default Home;
