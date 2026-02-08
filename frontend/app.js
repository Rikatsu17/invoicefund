import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.13.5/+esm";

import { CONFIG } from "./config.js";

const INVOICEFUND_ADDRESS = CONFIG.INVOICEFUND_ADDRESS;
const REWARDTOKEN_ADDRESS = CONFIG.REWARDTOKEN_ADDRESS;
const SEPOLIA_CHAIN_ID = CONFIG.CHAIN_ID;

let invoiceFundABI;
let rewardTokenABI;

async function loadABIs() {
  const invoiceRes = await fetch("abi/InvoiceFund.json");
  const rewardRes = await fetch("abi/RewardToken.json");

  const invoiceJson = await invoiceRes.json();
  const rewardJson = await rewardRes.json();

  invoiceFundABI = invoiceJson.abi;
  rewardTokenABI = rewardJson.abi;
}

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
    await loadABIs();
    console.log("ABIs loaded:", invoiceFundABI?.length, rewardTokenABI?.length);

    setStatus("Requesting account access...");
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    console.log("Detected chainId:", chainId);

    if (chainId !== SEPOLIA_CHAIN_ID) {
      setStatus("Please switch MetaMask to Sepolia network");
      return;
    }
    window.ethereum.on("accountsChanged", () => window.location.reload());
    window.ethereum.on("chainChanged", () => window.location.reload());

    signer = await provider.getSigner();
    userAddress = await signer.getAddress();
    el("addr").textContent = userAddress;

    invoiceFund = new ethers.Contract(INVOICEFUND_ADDRESS, invoiceFundABI, signer);
rewardToken = new ethers.Contract(REWARDTOKEN_ADDRESS, rewardTokenABI, provider);


    setStatus("Connected successfully ");
     await loadCampaigns();
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
    setStatus("Campaign created successfully ");
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
    setStatus("Loaded successfully ");
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
    setStatus("Contribution confirmed successfully ");
    await loadCampaigns();
    await refreshUI();
  } catch (e) {
    console.error(e);
    setStatus("Contribution failed");
  }
};

el("finalizeBtn").onclick = async () => {
  try {
    setStatus("Finalizing...");
    const id = BigInt(el("finalizeId").value.trim());
    const tx = await invoiceFund.finalize(id);
    setStatus(`Tx sent: ${tx.hash}`);
    await tx.wait();
    setStatus("Finalized successfully ");
    await loadCampaigns();
    await refreshUI();
  } catch (e) {
    console.error(e);
    setStatus("Finalize failed");
  }
};
