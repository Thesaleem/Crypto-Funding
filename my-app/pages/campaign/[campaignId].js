"use client";
import { useRouter } from "next/router";
import DonationForm from "@/components/danationForm";
import { useState, useContext, useEffect } from "react";
import WalletConnect from "@/store/WalletContext";
import { CROWD_FUNDING_CONTRACT_ADDRESS, CROWD_FUNDING_ABI } from "@/constants";
import { Contract, utils, BigNumber } from "ethers";


export default function Page() {
  const router = useRouter();
  const index = router.query.campaignId;
  const [amountToDonate, setAmountToDonate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [donated, setDonated] = useState(false);
  const [campaign, setCampaign] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);


  const {
    getProviderOrSigner,
    fetchCampaignsById,
    fetchAllCampaignsByAddress,
    fetchActiveAddressCampaign,
    checkActiveCampaign,
  } = useContext(WalletConnect);


  const donate = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const getCrowdFundingContract = new Contract(
        CROWD_FUNDING_CONTRACT_ADDRESS,
        CROWD_FUNDING_ABI,
        signer
      );
      const checkCampaignEnded = hasEnded();
      if (!checkCampaignEnded) {
        const amount = utils.parseEther(String(amountToDonate));
        const tx = await getCrowdFundingContract.donate(Number(index), amount, {
          value: amount,
          gasLimit: BigNumber.from("1000000"), 
        });
        setLoading(true);
        await tx.wait();
        setLoading(false);
        await fetchAllCampaignsByAddress();
        await fetchActiveAddressCampaign(true);
        await fetchActiveAddressCampaign();
        await checkActiveCampaign();

        setDonated(true);
      }
    } catch (error) {
      console.error(error);
      setLoading(false)
    }
  };

  const hasEnded = () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (campaign) {
      if (currentTimestamp > campaign.deadline  / 1000) {
        setCampaign((prev) => {
          return {
            ...prev,
            ended: true,
          };
        });
      }
      return currentTimestamp > campaign.deadline  / 1000;
    }
  };


  useEffect(() => {
    let isMounted = true;

    const fetchCampaign = async () => {
      try {
        const fetchedCampaign = await fetchCampaignsById(Number(index));
        setCampaign(fetchedCampaign);
      } catch (error) {
        console.error(error.message);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    fetchCampaign();

    return () => {
      isMounted = false;
    };
  }, [index]);


useEffect(() => {
    // Wait for campaign to be fetched before performing actions
    hasEnded();
}, [campaign?.ended]);

  return (
        <>
        {  
          <DonationForm
            setAmountToDonate={setAmountToDonate}
            amountToDonate={amountToDonate}
            donate={donate}
            donated={donated}
            campaign={campaign}
            loading={loading}
            isLoaded={isLoaded}
          />

        }
        </>

  );
}
