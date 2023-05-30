"use client";
import styles from "@/styles/Home.module.css";
import { Contract, utils } from "ethers";
import { useState, useContext } from "react";
import { CROWD_FUNDING_CONTRACT_ADDRESS, CROWD_FUNDING_ABI } from "@/constants";
import Main from "@/components/main";
import PurposeForm from "@/components/purposeForm";
import Campaign from "@/components/campaign";
import EndedCampaign from "@/components/endedCampaign";
import WalletConnect from "@/store/WalletContext";

export default function Home() {
  const formInitial = {
    purpose: "",
    goal: "",
  };

  const [formData, setFormData] = useState(formInitial);
  const [loading, setLoading] = useState(false);
  const [startCampaign, setStartCampaign] = useState(false);
  const [started, setStarted] = useState(false);

  const {
    getProviderOrSigner,
    fetchActiveAddressCampaign,
    fetchAllCampaignsByAddress,
    activeCampaignAddress,
    activeCampaign,
    withdrawToAddress,
    endedCampaignAddress,
  } = useContext(WalletConnect);

  const createCampaign = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const crowdFundingContract = getCrowdFundingContractInstance(signer);

      const goalInWei = utils.parseEther(String(formData.goal));
      const tx = await crowdFundingContract.createCampaign(
        goalInWei,
        formData.purpose
      );
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await fetchAllCampaignsByAddress();
      await fetchActiveAddressCampaign(true);
      await fetchActiveAddressCampaign();

      //to cause a little delay to allow state update
      // await new Promise((resolve) => setTimeout(resolve, 0));

      setStarted(true);
    } catch (error) {
      console.error(error.message);
      setStarted(false);
    }
  };

  const getCrowdFundingContractInstance = (providerOrSigner) => {
    return new Contract(
      CROWD_FUNDING_CONTRACT_ADDRESS,
      CROWD_FUNDING_ABI,
      providerOrSigner
    );
  };

  return (
    <>
      {!startCampaign && (
        <>
          <Main handleClick={setStartCampaign} />

          <div className={styles.campaign}>
            <h3>My campaigns</h3>
            {activeCampaignAddress.length === 0 && !activeCampaign && (
              <p>You have no active campaign!</p>
            )}

            {activeCampaign && (
              <>
                <Campaign />
                {activeCampaign && (
                  <p>Come back to withdraw funds when campaign is over</p>
                )}
              </>
            )}

            <h4>Ended Campaigns</h4>
            {endedCampaignAddress.length === 0 && (
              <p>You have no ended campaign!</p>
            )}
           {endedCampaignAddress.length > 0  && <div className={styles.endedCon}>
              {endedCampaignAddress.map((cam) => {
                return (
                  <EndedCampaign
                    key={cam.campaignId}
                    id={cam.campaignId}
                    fundsWithdrawn={cam.fundsWithdrawn}
                    description={cam.description}
                    donatedAmount={cam.donatedAmount}
                    fundingGoal={cam.fundingGoal}
                  />
                );
              })}
            </div>}
          </div>
        </>
      )}

      {startCampaign && (
        <PurposeForm
          setFormData={setFormData}
          formData={formData}
          createCampaign={createCampaign}
          loading={loading}
          started={started}
        />
      )}


    </>
  );
}
