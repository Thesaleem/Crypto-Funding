//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Crowdfunding is Ownable {
    struct Campaign {
        address creator;

        uint256 deadline;

        uint256 fundingGoal;

        string description;

        bool ended;

        uint256 donatedAmount;

        bool fundsWithdrawn;

        bool exists;

    }

    uint256 public campaignCounter; 

    mapping(address => uint256[]) public campaignsByAddress;

    mapping(uint256 => Campaign) public campaigns;

    function getCampaignById(uint256 id) public view returns (Campaign memory ) {
        Campaign storage campaign = campaigns[id];
        require(id >= 0 && id <= campaignCounter, 'Invalid campaign ID');
        require(campaigns[id].exists, "Campaign does not exist");
        return campaign;
    }

    function createCampaign(uint256 _fundingGoal, string memory _description) public returns(uint256) {
        require(_fundingGoal > 0, "Goal should be greater than zero");

        Campaign storage campaign = campaigns[campaignCounter];
        campaignsByAddress[msg.sender].push(campaignCounter);

        campaign.creator = msg.sender;
        campaign.deadline = block.timestamp + 3 days;
        campaign.fundingGoal = _fundingGoal;
        campaign.description = _description;
        campaign.exists = true;   
       
        //checks the number of campaigns carried out
        campaignCounter++;

        //returns index
        return campaignCounter - 1;     
    }

    function getCampaignByAddress (address _address) public view returns (uint256[] memory){
        return campaignsByAddress[_address];
    }

    function donate (uint256 counterIndex, uint256 donation) public payable {
        Campaign storage campaign = campaigns[counterIndex];
        //make sure the amount available is more than what is to be donated

        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(donation > 0, "Donation should be greater than zero");
        // require(msg.value > donation, "Not Enough Funds");

        campaign.donatedAmount += donation;

    } 

    function checkCampaignEnded (uint256 counterIndex) public returns(bool) {
        Campaign storage campaign = campaigns[counterIndex];
    
        require(!campaign.ended, "Campaign has already ended");
        require(block.timestamp > campaign.deadline, "Campaign has not ended");
        campaign.ended = true;
        return true;
    }

    function withdrawOwnFunds(uint256 counterIndex) public returns(bool) {
        Campaign storage campaign = campaigns[counterIndex];
        require(block.timestamp > campaign.deadline, "Campaign has not ended");
        address payable owner = payable(campaign.creator);
        uint256 amountDonated = campaign.donatedAmount;
        require(owner == msg.sender, 'Not owner of campaign');
        require(amountDonated > 0, 'You don not have any donated gEth');
        campaign.fundsWithdrawn = true;

        (bool sent, ) = owner.call{value: amountDonated}("");
        require(sent, "Failed to send ether to campaign creator");

        return true;
    }


    function withdrawToCampaignCreator(uint256 counterIndex) public onlyOwner {
        Campaign storage campaign = campaigns[counterIndex];

        address payable campaignOwner = payable(campaign.creator);
        uint256 amount = campaign.donatedAmount;
        
        require(block.timestamp > campaign.deadline, "Campaign has not ended");
        require(amount > 0, 'You don not have any donated gEth');
        campaign.fundsWithdrawn = true;

        (bool sent, ) = campaignOwner.call{value: amount}("");
        require(sent, "Failed to send ether to campaign creator");


    }

    receive() external payable {}
    fallback() external payable {}
}