// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./RewardToken.sol";

contract InvoiceFund is ReentrancyGuard {
    struct Campaign {
        string title;
        address owner;
        uint256 goalWei;
        uint256 deadline; 
        uint256 raisedWei;
        bool finalized;
    }

    RewardToken public rewardToken;

    uint256 public constant REWARD_RATE = 100; 

    Campaign[] private campaigns;

    mapping(uint256 => mapping(address => uint256)) public contributions;

    event CampaignCreated(uint256 indexed campaignId, address indexed owner, string title, uint256 goalWei, uint256 deadline);
    event Contributed(uint256 indexed campaignId, address indexed contributor, uint256 amountWei, uint256 rewardAmount);
    event Finalized(uint256 indexed campaignId);

    constructor(address rewardTokenAddress) {
        rewardToken = RewardToken(rewardTokenAddress);
    }

    function createCampaign(
        string calldata title,
        uint256 goalWei,
        uint256 durationSeconds
    ) external returns (uint256 campaignId) {
        require(bytes(title).length > 0, "Title required");
        require(goalWei > 0, "Goal must be > 0");
        require(durationSeconds > 0, "Duration must be > 0");

        uint256 deadline = block.timestamp + durationSeconds;

        campaigns.push(
            Campaign({
                title: title,
                owner: msg.sender,
                goalWei: goalWei,
                deadline: deadline,
                raisedWei: 0,
                finalized: false
            })
        );

        campaignId = campaigns.length - 1;
        emit CampaignCreated(campaignId, msg.sender, title, goalWei, deadline);
    }

    function contribute(uint256 campaignId) external payable nonReentrant {
        require(campaignId < campaigns.length, "Invalid campaign");
        Campaign storage c = campaigns[campaignId];

        require(!c.finalized, "Campaign finalized");
        require(block.timestamp < c.deadline, "Campaign ended");
        require(msg.value > 0, "Send ETH");

        contributions[campaignId][msg.sender] += msg.value;
        c.raisedWei += msg.value;

        uint256 rewardAmount = msg.value * REWARD_RATE;
        rewardToken.mint(msg.sender, rewardAmount);

        emit Contributed(campaignId, msg.sender, msg.value, rewardAmount);
    }

    function finalize(uint256 campaignId) external {
        require(campaignId < campaigns.length, "Invalid campaign");
        Campaign storage c = campaigns[campaignId];

        require(!c.finalized, "Already finalized");
        require(block.timestamp >= c.deadline, "Too early");

        c.finalized = true;
        emit Finalized(campaignId);
    }


    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }

    function getCampaign(uint256 campaignId) external view returns (
        string memory title,
        address owner,
        uint256 goalWei,
        uint256 deadline,
        uint256 raisedWei,
        bool finalized
    ) {
        require(campaignId < campaigns.length, "Invalid campaign");
        Campaign memory c = campaigns[campaignId];
        return (c.title, c.owner, c.goalWei, c.deadline, c.raisedWei, c.finalized);
    }
}
