import styles from '@/styles/Home.module.css'
import { useContext, useEffect, useState } from "react";
import ProgressBar from './progressBar';


import WalletConnect from "@/store/WalletContext";

export default function Campaign () {
  const [countdown, setCountdown] = useState("");

  const { activeCampaignAddress, campaignIndex } = useContext(WalletConnect);


  // Function to calculate the remaining time
  const calculateRemainingTime = async () => {
    // if(activeCampaign){
    //   return;
    // }
    // Get the current timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Calculate the remaining time in seconds
    const remainingTime = activeCampaignAddress[0]?.deadline / 1000 - currentTimestamp;
    // Check if the deadline has passed
    if (remainingTime <= 0) {
      // Display a message or perform any action when the deadline is reached
      setCountdown("Deadline reached");
      return;
    }

    // Calculate the remaining days, hours, minutes, and seconds
    const days = Math.floor(remainingTime / (24 * 60 * 60));
    const hours = Math.floor((remainingTime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
    const seconds = remainingTime % 60;

    // Format the remaining time based on the largest unit
    let remainingTimeString = "";
    if (days > 0) {
      remainingTimeString = `${days} day${days > 1 ? "s" : ""} left`;
    } else if (hours > 0) {
      remainingTimeString = `${hours} hour${hours > 1 ? "s" : ""} left`;
    } else if (minutes > 0) {
      remainingTimeString = `${minutes} minute${minutes > 1 ? "s" : ""} left`;
    } else {
      remainingTimeString = `${seconds} second${seconds > 1 ? "s" : ""} left`;
    }

    // Update the countdown element with the remaining time
    setCountdown(remainingTimeString);


  };

  useEffect(() => {
    const interval = setInterval(() => calculateRemainingTime(), 1000)

    return () => clearInterval(interval)
  }, [])

  const percentReached = (Number(activeCampaignAddress[0]?.donatedAmount) / Number(activeCampaignAddress[0]?.fundingGoal)) * 100

  return (
        <div className={styles.card}>
            <h4>{activeCampaignAddress[0]?.description}</h4>
            <div className={styles.amount}>
              <p>Raised: {activeCampaignAddress[0]?.donatedAmount}gEth</p>
              <p>Target: {activeCampaignAddress[0]?.fundingGoal}gEth</p>
            </div>
            <ProgressBar completed={percentReached} />
            <div className={styles.time}>
              <p>{percentReached.toFixed(2)}% reached</p>
              <p>{countdown}</p>
            </div>
            <p>{`https://crypfund.vercel.app/campaign/${campaignIndex}`}</p>
        </div>
    )
}