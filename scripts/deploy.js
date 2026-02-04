const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1) Deploy RewardToken
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy();
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log("RewardToken deployed to:", rewardTokenAddress);

  // 2) Deploy InvoiceFund with token address
  const InvoiceFund = await hre.ethers.getContractFactory("InvoiceFund");
  const invoiceFund = await InvoiceFund.deploy(rewardTokenAddress);
  await invoiceFund.waitForDeployment();
  const invoiceFundAddress = await invoiceFund.getAddress();
  console.log("InvoiceFund deployed to:", invoiceFundAddress);

  // 3) Transfer ownership of token to InvoiceFund (so it can mint)
  const tx = await rewardToken.transferOwnership(invoiceFundAddress);
  await tx.wait();
  console.log("RewardToken ownership transferred to InvoiceFund ✅");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
