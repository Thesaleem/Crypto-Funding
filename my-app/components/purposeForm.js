'use client'

import styles from '@/styles/Home.module.css'
import { useState, useContext, useEffect } from 'react'
import WalletConnect from "@/store/WalletContext";


export default function PurposeForm ({setFormData, createCampaign, formData, loading, started}){
    const formInitial = {
        purpose: "",
        goal: "",
    };
    const { activeCampaign, activeCampaignAddress, campaignIndex } = useContext(WalletConnect);

    const [clickIcon, setClickIcon] = useState(false)
    

    const handleClick = () => {
        navigator.clipboard.writeText(`https://crypfund.vercel.app/campaign/${campaignIndex}`)
        setClickIcon(true)
    }

    const handleInput = (e) => {
        const {name, value} = e.target;
        setFormData(prevData => {
            return {
                ...prevData,
                [name]: value
            }
        })
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        createCampaign();
        setFormData(() => formInitial)
    }

    setInterval(() => {
        if(clickIcon){
            setClickIcon(false)
        }
    }, 4 * 1000)

    const style = {
        opacity: '0.5',
        pointerEvents: 'none',
    }   

    useEffect(() => {

    }, [campaignIndex])

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <p >Duration of every campaign is 3 days</p>
            <label htmlFor="description">Purpose of crowdfunding</label>
            <input type="text" id='description' name='purpose' onChange={handleInput} value={formData.purpose}  required />

            <label htmlFor="goal">Funding Goal (gEth) </label>
            <input type='number' id='goal' name='goal' onChange={handleInput} value={formData.goal} required />

            {/* disable button if there's an active campaign and put a note to check back */}
            <button className={styles.button} disabled={activeCampaign} style={activeCampaign ? style : null}>{loading ? 'Loading...' : 'Submit'}</button>
            {activeCampaign && <p>There is an active campaign, you can start a new one when this expires</p>}

            {started && 
                <div className={styles.link}>
                    <div className={styles.sharedlink}>
                        <p>{`https://crypfund.vercel.app/campaign/${campaignIndex}`}</p>
                    </div>
                    <div className={styles.address}>
                        <img src="../copy.png" onClick={handleClick} alt="" className={styles.copy} />
                        <div className={styles.hover}>
                            <p className="">{clickIcon ? 'Copied' : 'Copy campaign address'}</p>    
                        </div>
                    </div>
                </div>
            }
        </form>
    )
}