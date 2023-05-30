require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({path: '.env'});

const QUICKNODE_HTTP_URL = process.env.QUICKNODE_HTTP_URL
const ALCHEMY_HTTP_SEPHOLIA_URL = process.env.ALCHEMY_HTTP_SEPHOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    goerli: {
      url: QUICKNODE_HTTP_URL,
      accounts: [PRIVATE_KEY],
    },
    // sepholia: {
    //   url: ALCHEMY_HTTP_SEPHOLIA_URL,
    //   accounts: [PRIVATE_KEY]
    // }
  }
};
