const { ethers } = require("hardhat");

async function main() {
  const crowdFundingContract = await ethers.getContractFactory("Crowdfunding");
  const deployCrowdFundingContract = await crowdFundingContract.deploy();

  await deployCrowdFundingContract.deployed();
  console.log(
    "crowdFundingContractAddress:",
    deployCrowdFundingContract.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
