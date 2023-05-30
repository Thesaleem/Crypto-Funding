import styles from '@/styles/Home.module.css'
import { useContext } from "react";
import ProgressBar from './progressBar';

import WalletConnect from "@/store/WalletContext";

export default function EndedCampaign ({id, fundsWithdrawn, description, donatedAmount, fundingGoal}) {
    const { loading, alreadyWithdrawn, withdrawToAddress } = useContext(WalletConnect);

    const percentReached = (Number(donatedAmount) / Number(fundingGoal)) * 100
    return (
        <div className={styles.ended}>
            <div className="">
                <div className={styles.card}>
                    <h4>{description}</h4>
                    <div className={styles.amount}>
                    <p>Raised: {donatedAmount} gEth</p>
                    <p>Target: {fundingGoal} gEth</p>
                    </div>
                    <ProgressBar completed={percentReached} />
                    <div className={styles.time}>
                    <p>{percentReached.toFixed(2)}% reached</p>
                    <p>Campaign over</p>
                    </div>
                    {fundsWithdrawn && <p>Funds withdrawn already</p>}
                </div>
                {donatedAmount > 0 && !alreadyWithdrawn && !fundsWithdrawn && (
                    <button className={styles.button} onClick={() => withdrawToAddress(id)}>
                        {loading ? "Loading..." : "Withdraw funds"}
                    </button>
                )}

                {alreadyWithdrawn && <p>You have sucessfully withdrawn the eth to your wallet</p>}

            </div>
        
        </div>

    )
}