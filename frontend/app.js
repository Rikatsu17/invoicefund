import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.13.5/+esm";

// === PUT YOUR LOCALHOST ADDRESSES HERE ===
const INVOICEFUND_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const REWARDTOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Minimal ABI (only what we use)
const invoiceFundAbi = [
  "function createCampaign(string title, uint256 goalWei, uint256 durationSeconds) returns (uint256)",
  "function contribute(uint256 campaignId) payable",
  "function getCampaignCount() view returns (uint256)",
  "function getCampaign(uint256 campaignId) view returns (string title, address owner, uint256 goalWei, uint256 deadline, uint256 raisedWei, bool finalized)"
];

const rewardTokenAbi = [
  "function balanceOf(address) view returns (uint256)"
];

let provider, signer, userAddress, invoiceFund, rewardToken;

const el = (id) => document.getElementById(id);
const setStatus = (s) => (el("status").textContent = s);

function chainName(chainId) {
  if (chainId === 31337n) return "Hardhat Localhost (31337)";
  if (chainId === 11155111n) return "Sepolia (11155111)";
  return `ChainId ${chainId}`;
}

async function refreshUI() {
  if (!provider || !userAddress) return;

  const net = await provider.getNetwork();
  el("net").textContent = chainName(net.chainId);

  const ethBal = await provider.getBalance(userAddress);
  el("ethBal").textContent = ethers.formatEther(ethBal);

  const invBal = await rewardToken.balanceOf(userAddress);
  el("invBal").textContent = ethers.formatUnits(invBal, 18);
}

async function loadCampaigns() {
  const count = await invoiceFund.getCampaignCount();
  el("count").textContent = count.toString();
  const box = el("campaigns");
  box.innerHTML = "";

  for (let i = 0; i < Number(count); i++) {
    const c = await invoiceFund.getCampaign(i);
    const title = c[0];
    const owner = c[1];
    const goalEth = ethers.formatEther(c[2]);
    const deadline = new Date(Number(c[3]) * 1000).toLocaleString();
    const raisedEth = ethers.formatEther(c[4]);
    const finalized = c[5];

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <b>ID ${i}</b><br/>
      Title: ${title}<br/>
      Owner: ${owner}<br/>
      Goal: ${goalEth} ETH<br/>
      Raised: ${raisedEth} ETH<br/>
      Deadline: ${deadline}<br/>
      Finalized: ${finalized}
    `;
    box.appendChild(div);
  }
}

el("connectBtn").onclick = async () => {
  try {
    if (!window.ethereum) {
      alert("MetaMask not found!");
      return;
    }

    setStatus("Requesting account access...");
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();
    el("addr").textContent = userAddress;

    invoiceFund = new ethers.Contract(INVOICEFUND_ADDRESS, invoiceFundAbi, signer);
    rewardToken = new ethers.Contract(REWARDTOKEN_ADDRESS, rewardTokenAbi, provider);

    setStatus("Connected ✅");
    await refreshUI();
  } catch (e) {
    console.error(e);
    setStatus("Error connecting");
  }
};

el("createBtn").onclick = async () => {
  try {
    setStatus("Creating campaign...");
    const title = el("title").value.trim();
    const goalEth = el("goalEth").value.trim();
    const durationSec = el("durationSec").value.trim();

    const goalWei = ethers.parseEther(goalEth);

    const tx = await invoiceFund.createCampaign(title, goalWei, BigInt(durationSec));
    setStatus(`Tx sent: ${tx.hash}`);
    await tx.wait();
    setStatus("Campaign created ✅");
    await loadCampaigns();
    await refreshUI();
  } catch (e) {
    console.error(e);
    setStatus("Create failed (check inputs / network)");
  }
};

el("loadBtn").onclick = async () => {
  try {
    setStatus("Loading campaigns...");
    await loadCampaigns();
    setStatus("Loaded ✅");
  } catch (e) {
    console.error(e);
    setStatus("Load failed");
  }
};

el("contribBtn").onclick = async () => {
  try {
    setStatus("Sending contribution...");
    const id = BigInt(el("campId").value.trim());
    const amountEth = el("amountEth").value.trim();

    const tx = await invoiceFund.contribute(id, { value: ethers.parseEther(amountEth) });
    setStatus(`Tx sent: ${tx.hash}`);
    await tx.wait();
    setStatus("Contribution confirmed ✅");
    await loadCampaigns();
    await refreshUI();
  } catch (e) {
    console.error(e);
    setStatus("Contribution failed");
  }
};
