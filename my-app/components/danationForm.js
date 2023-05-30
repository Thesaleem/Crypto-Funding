import styles from '@/styles/Home.module.css'

export default function DonationForm({isLoaded, setAmountToDonate, amountToDonate, donate, campaign, donated, loading }) {
    const handleSubmit = (e) => {
      e.preventDefault();
      donate();
      setAmountToDonate(() => '')
    };
  
    if (!isLoaded) {
      // Campaign is still being fetched
      return <p>Loading campaign...</p>;
    }
  
    if (!campaign || !campaign.exists) {
      // Campaign does not exist
      return <h3>Unable to fetch Campaign ID or ID does not exist</h3>;
    }
  
    return (
      <div className="">
        {!campaign.ended &&
        
          <form className={styles.form} onSubmit={handleSubmit}>
            <label htmlFor="amount">Amount to donate (gEth)</label>
            <input
              type="number"
              id="amount"
              required
              onChange={(e) => setAmountToDonate(e.target.value)}
              value={amountToDonate}
            /> 
            <button className={styles.button}>{loading ? 'Loading...' : "Donate"}</button>
            {donated && <div className={styles.appreciation}>
              Thanks for donating!!!
            </div>}
          </form>
        }
        {campaign.ended && <h1>Campaign has ended!</h1>}
      </div>
    );
  }


  