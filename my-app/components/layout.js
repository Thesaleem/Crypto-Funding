import styles from "@/styles/Home.module.css";
import Head from "next/head";
import { Inter } from "next/font/google";
import WalletConnect from "@/store/WalletContext";
import { useState, useEffect, useRef } from "react";
import { CROWD_FUNDING_CONTRACT_ADDRESS, CROWD_FUNDING_ABI } from "@/constants";

import Web3Modal from "web3modal";
import { providers, Contract, BigNumber, utils, ethers } from "ethers";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function Layout({ children }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [allAddressCampaign, setAllAddressCampaign] = useState([]);
  const [activeCampaignAddress, setActiveCampaignAddress] = useState([]);
  const [activeCampaign, setActiveCampaign] = useState(false);
  const [endedCampaignAddress, setEndedCampaignAddress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alreadyWithdrawn, setAlreadyWithdrawn] = useState(false);
  const [campaignIndex, setCampaignIndex] = useState("");
  const [error, setError] = useState("");
  const [owner, setOwner] = useState(false);
  const [signersAddress, setSignersAddress] = useState()
  const [totalCampaigns, setTotalCampaigns] = useState()
  const [contractBalance, setContractBalance] = useState(0)

  const web3ModalRef = useRef();


  const withdrawToAddress = async (id) => {
    try {
      const signer = await getProviderOrSigner(true);
      const crowdFundingContract = getCrowdFundingContractInstance(signer);
      const tx = await crowdFundingContract.withdrawOwnFunds(id);

      setLoading(true);
      await tx.wait();
      setAlreadyWithdrawn(true)
      setLoading(false);
      await fetchAllCampaignsByAddress();
      await fetchActiveAddressCampaign(true);
      await fetchActiveAddressCampaign();
      await checkActiveCampaign();

    } catch (error) {
      console.error(error);
      setAlreadyWithdrawn(false)

    }
  };


  // to know if there's any active campaign in an address
  const checkActiveCampaign = async () => {
    const active = await fetchActiveAddressCampaign(true)
    if (active?.length > 0){
      setActiveCampaign(true)
    }
  };

  //to fetch only the active campaign of an address
  const fetchActiveAddressCampaign = async (ongoing = false) => {
    const campaigns = await fetchAllCampaignsByAddress()
    if (campaigns?.length === 0 || campaigns === undefined) {
      return;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    //if campaign is ongoing
    if(ongoing){
      const active = campaigns.filter(
        (cam) => currentTimestamp < cam.deadline / 1000
      );

      if (active.length === 0){
        return;
      }

      setActiveCampaignAddress(active);
      setCampaignIndex(active[0]?.campaignId);
      //means there is an active campaign
      return active
    }

    //if campaign has ended
    const findNotActive = campaigns.filter(cam => currentTimestamp > cam.deadline / 1000)
    const ended = findNotActive.map(cam => {
      if(cam.ended === false){
        return {
          ...cam,
          ended: true,
        }
      }
    })
    if (ended.length === 0){
      return
    }
    setEndedCampaignAddress(() => ended)
  };

  //to fetch all campaigns of an address
  const fetchAllCampaignsByAddress = async () => {
    try {
      const provider = await getProviderOrSigner();
      const crowdFundingContract = getCrowdFundingContractInstance(provider);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const addressCampaign = await crowdFundingContract.getCampaignByAddress(
        address
      );
      const indexNumbers = addressCampaign.map((num) => num.toNumber());
      if (indexNumbers.length === 0) {
        return;
      }

      let campaigns = [];
      for (let i = 0; i < indexNumbers.length; i++) {
        const campaign = await fetchCampaignsById(indexNumbers[i]);
        campaigns.push(campaign);
      }
      setAllAddressCampaign(campaigns);
      return campaigns
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchCampaignsById = async (id) => {
    try {
      const provider = await getProviderOrSigner();
      const crowdFundingContract = getCrowdFundingContractInstance(provider);
      const campaign = await crowdFundingContract.getCampaignById(id);

      const parsedCampaign = {
        campaignId: id,
        creator: campaign.creator.toString(),
        deadline: new Date(parseInt(campaign.deadline.toString() * 1000)),
        fundingGoal: utils.formatEther(campaign.fundingGoal.toString()),
        description: campaign.description.toString(),
        ended: false,
        donatedAmount: utils.formatEther(campaign.donatedAmount.toString()),
        fundsWithdrawn: campaign.fundsWithdrawn,
        exists: campaign.exists,
      };

      return parsedCampaign;
    } catch (error) {
      console.error(error.message);
    }
  };

  const getAddress = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const crowdFundingContract = getCrowdFundingContractInstance(signer)
      const _owner = await crowdFundingContract.owner();
      const address = await signer.getAddress()
      const shortAddress = String(address).slice( 0, 4 ) + "...." + String(address).slice( -4 );
      setSignersAddress(shortAddress)
      if(_owner.toLowerCase() === address.toLowerCase()){
        setOwner(true)
      }
      
    } catch (error) {
      console.error(error.message);
    }
  }

  const getContractBalance = async () => {
    try {
      const provider = await getProviderOrSigner ()
      const balance = await provider.getBalance('0xb24F24cB5fCffD2b3C3A695e09310eF8bE9FFB0f')
      setContractBalance(utils.formatEther(balance))
      
    } catch (error) {
      console.error(error);
    }
  }

  const numOfCampaigns = async () => {
    try {
      const provider = await getProviderOrSigner ()
      const crowdFundingContract = getCrowdFundingContractInstance(provider)
      const collectCounter = await crowdFundingContract.campaignCounter()
      setTotalCampaigns(collectCounter.toNumber())
      
    } catch (error) {
      console.error(error.message);
    }
  } 
  const getCrowdFundingContractInstance = (providerOrSigner) => {
    return new Contract(
      CROWD_FUNDING_CONTRACT_ADDRESS,
      CROWD_FUNDING_ABI,
      providerOrSigner
    );
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (parseInt(chainId) !== 5) {
      setError("You are connected to the wrong network, connect to goerli network")
      throw new Error("Connect to Goerli Network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();

      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
    connectWallet().then(() => {
      fetchAllCampaignsByAddress()
      fetchActiveAddressCampaign(true)
      fetchActiveAddressCampaign();
      checkActiveCampaign(); 
      numOfCampaigns();
      getContractBalance();
      getAddress();
    });
  }, [walletConnected]);

  return (
    <WalletConnect.Provider
      value={{
        walletConnected,
        getProviderOrSigner,
        checkActiveCampaign,
        fetchActiveAddressCampaign,
        fetchCampaignsById,
        withdrawToAddress,
        fetchAllCampaignsByAddress,
        campaignIndex,
        activeCampaignAddress,
        activeCampaign,
        endedCampaignAddress,
        loading,
        alreadyWithdrawn
      }}
    >
      <div className={`${styles.body} ${inter.className}`}>
        <Head>
          <title>Crypto Funding</title>
          <meta name="description" content="Crypto Funding" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Link href={"/"} className={styles.anchor}>
          <header className={styles.header}>
            <p className={styles.logo}>crypfund</p>
            <button className={styles.button} onClick={connectWallet}>
              {walletConnected ? signersAddress : "Connect Wallet"}
            </button>
          </header>
          <div className="" style={{display:'flex', justifyContent:'flex-end'}}>
            <p>{error}</p>
          </div>
        </Link>

        <main>{children}</main>
        <div className="">
          {owner ? `Total Campaigns: ${totalCampaigns}` : ''}
        </div>
        <div className="">
          {owner ? `Contract's Balance: ${contractBalance}` : ''}
        </div>
        <footer className={styles.footer}>Made with ❤️ by <a href="https://github.com/thesaleem" target='_blank'>Saleem</a></footer>
      </div>
    </WalletConnect.Provider>
  );
}
