import styles from '@/styles/Home.module.css'

export default function Main ({handleClick}) {
    return (
        <div className={styles.hero}>
            <div className={styles.heroContent}>
            <h2 className={styles.heroHeader}>
                Let's make the impossible, possible
            </h2>
            <p>Start a campaign and crowd fund goerli ether.</p>
            <button className={styles.button} onClick={() => handleClick(true)}>Start campaign</button>
            </div>
            <div className={styles.image}>
            <img src="../pic.png" alt=""  />
            </div>
      </div>
    )
}