<h1><b>Blockchain Final Project</b></h1>

  <p>
    <b>Course:</b> Blockchain 1<br>
    <b>Project:</b> InvoiceFund — Decentralized Crowdfunding DApp
  </p>

  <h1>Team Members</h1>
  <p>
    Daniyal Adilbekov SE-2435<br>
    Bibifatima Bisesheva SE-2437<br>
    Ataniyaz Mutigolla SE-2437
  </p>

  <h1>InvoiceFund — Decentralized Crowdfunding DApp</h1>

  <h1>Project Overview</h1> So, basically, InvoiceFund is a decentralized crowdfunding platform designed to provide early liquidity to businesses awaiting invoice payments. Instead of relying on banks or intermediaries, funding is raised through smart contracts. Participants receive ERC-20 reward tokens, which demonstrate proportional participation and accountability on the blockchain. The system operates entirely on the Ethereum Sepolia testnet using MetaMask.<br> Aand This project was developed as a final project and operates exclusively on an Ethereum test network using free test tokens.<br> This project was developed as a blockchain final project<br>

  <h1> Purpose of the Project</h1>
  
  The main objective of this project is to demonstrate practical knowledge of: <br> Using Solidity for smart contracts<BR>
  ERC-20 tokens integration<BR> Client-side blockchain interaction using JavaScript<br> MetaMask wallet integration<br> Interaction with sepolia test networks<br> Basic dapp architecture<br> The application addresses the problem of delayed invoice payments by simulating decentralized invoice crowdfunding.
  
  <h1>Technology Stack Solidity</h1>
  Solidity<br> Hardhat Ethereum Sepolia Test Network<br> ERC-20 Token Standard<br> JavaScript<br> MetaMask<br> HTML & CSS<br>
<h1>How to Run the Project</h1>
Steps<br>

1)Navigate to the frontend directory:
<pre>cd frontend
</pre>

2)Start a local static server:<br>
<pre>http-server -p 5173 -c-1
</pre>

3)Open the application in a browser:<br>
<pre>http://127.0.0.1:5173
</pre>

4)Switch MetaMask to the Sepolia Test Network

5)Connect MetaMask and interact with the DApp
  <h2>Smart Contracts</h2>

  <p>The project consists of two smart contracts:</p>

  <h3>1. InvoiceFund</h3>
  <p>Responsible for:</p>
Creating crowdfunding campaigns<br>
Accepting ETH contributions<br>
Tracking individual and total contributions<br>
Finalizing campaigns after the deadline<br>
Minting reward tokens for contributors<br>

### 2. RewardToken (ERC-20)

Custom ERC-20 token(inv)<br>
Minted automatically during campaign participation<br>
Has no real monetary value<br>
Used strictly for educational demonstration<br>

  <hr>

  <h2>Deployed Contract Addresses (Sepolia Testnet)</h2>

    <b>InvoiceFund:</b> 0xbADA66D973aa12c43f06F8f46b846F04f3CC2c7c<br>
    <b>RewardToken:</b> 0xaC3C1F55973Ea2c1137b3295D52fBB556C11569e<br>

  <hr>

  <h2>Frontend Features</h2>

  <p>The client-side application allows users to:</p>

Connect a MetaMask wallet<br>
Validate the active blockchain network (Sepolia)<br>
View wallet address and balances (ETH & INV)<br>
Create crowdfunding campaigns<br>
Browse existing campaigns<br>
Contribute test ETH to campaigns<br>
Automatically receive ERC-20 reward tokens<br>
Finalizing campaigns<br>

  <p>
    All blockchain transactions are executed securely through MetaMask.
  </p>
<h1>Frontend to blockchain interaction</h1>

<p>
The frontend interacts with the Ethereum Sepolia test network using <b>app.js</b> and the
<b>MetaMask</b> wallet.
MetaMask provides the connection between the web application and the blockchain.
</p>

<p>
After the user connects MetaMask, the application initializes an app <b>BrowserProvider</b>
and obtains a signer representing the active wallet account.
Smart contracts are accessed using their deployed addresses and ABI files.
</p> 
 <p>
Read-only operations (loading campaigns, checking balances) are performed via the provider,
while state-changing operations (creating campaigns, contributing ETH, finalizing campaigns)
are executed as blockchain transactions and require user confirmation through MetaMask.
</p>
<p>
The frontend validates that the user is connected to the Sepolia test network and listens
for MetaMask account or network changes to keep the application state consistent.
</p>

  <hr>

  <h2>Project Structure</h2>

  <pre>
contracts/
├── InvoiceFund.sol
├── RewardToken.sol

scripts/
├── deploy.js

frontend/
├── abi/
├── app.js
├── config.js
├── index.html
├── home.html
├── about.html
├── styles.css

test/
├── InvoiceFund.test.js

hardhat.config.js
README.md
  </pre>

<H1> Get sepolia test eth</H1>
get account adress<br>
get sepolia eth faucet from google cloud web 3<br>
https://cloud.google.com/application/web3/faucet/ethereum/sepolia
<b>deploy to sepolia</b><br>
<pre>npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
</pre>


<h1>reward formula </h1>
Reward tokens are minted proportionally to the contributed ETH using the following formula:<br>
<b>Reward = contributionWei × REWARD_RATE / 1e18</b><br>
contributionWei — amount of ETH contributed<br>

REWARD_RATE — fixed reward multiplier<br>

1e18 — normalization factor for decimals<br>

The InvoiceFund contract then calls the mint() function on the RewardToken contract.<br>
<pre>
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
 </pre>
 What are Reward Tokens in InvoiceFund?><br>

In the InvoiceFund DApp, reward tokens (INV) are custom ERC-20 tokens that are automatically minted when a user contributes ETH to a crowdfunding campaign.

These tokens do not represent real money or financial profit.
They exist purely for educational and demonstration purposes and are used to illustrate how tokenization works in decentralized applications.
<h1>Testing</h1>
Automated unit tests are implemented using Hardhat to verify contract deployment, creating commpaigns, contribution logic, reward token minting and etc.
To run it write in terminal:<br>
<pre>npx hardhat test</pre>

<h1>Conclusion</h1>
InvoiceFund demonstrates a complete decentralized crowdfunding workflow using Ethereum smart contracts, MetaMask integration, and a client-side DApp interface.
The project highlights key blockchain concepts such as decentralization, transparency, tokenization, and secure user interaction on a test network.
