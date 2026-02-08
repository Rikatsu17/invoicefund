const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InvoiceFund DApp", function () {
  async function deployFixture() {
    const [owner, contributor1, contributor2] = await ethers.getSigners();

    const RewardToken = await ethers.getContractFactory("RewardToken");
    const rewardToken = await RewardToken.deploy();
    await rewardToken.waitForDeployment();

    const InvoiceFund = await ethers.getContractFactory("InvoiceFund");
    const invoiceFund = await InvoiceFund.deploy(await rewardToken.getAddress());
    await invoiceFund.waitForDeployment();

    await rewardToken.transferOwnership(await invoiceFund.getAddress());

    return { owner, contributor1, contributor2, rewardToken, invoiceFund };
  }

  it("Should deploy and transfer RewardToken ownership to InvoiceFund", async function () {
    const { rewardToken, invoiceFund } = await deployFixture();
    expect(await rewardToken.owner()).to.equal(await invoiceFund.getAddress());
  });

  it("Should create a campaign with correct parameters", async function () {
  const { invoiceFund, owner } = await deployFixture();

  const goal = ethers.parseEther("1");
  const duration = 3600;

  await (await invoiceFund.connect(owner).createCampaign("Invoice #1", goal, duration)).wait();

  const c = await invoiceFund.getCampaign(0);

  expect(c[0]).to.equal("Invoice #1");
  expect(c[1]).to.equal(owner.address);
  expect(c[2]).to.equal(goal);

  expect(c[3]).to.be.gt(0n);

  expect(c[4]).to.equal(0n);

  expect(c[5]).to.equal(false);
});

it("Should accept contributions and track raised amount", async function () {
  const { invoiceFund, contributor1 } = await deployFixture();

  await (await invoiceFund.createCampaign("Invoice #1", ethers.parseEther("1"), 3600)).wait();

  const amount = ethers.parseEther("0.1");
  await (await invoiceFund.connect(contributor1).contribute(0, { value: amount })).wait();

  const c = await invoiceFund.getCampaign(0);

  expect(c[4]).to.equal(amount);
});


  it("Should mint reward tokens proportional to contribution", async function () {
    const { invoiceFund, rewardToken, contributor1 } = await deployFixture();

    await (await invoiceFund.createCampaign("Invoice #1", ethers.parseEther("1"), 3600)).wait();

    await (await invoiceFund.connect(contributor1).contribute(0, { value: ethers.parseEther("0.1") })).wait();

    const expected = ethers.parseUnits("10", 18);

    const bal = await rewardToken.balanceOf(contributor1.address);
    expect(bal).to.equal(expected);
  });

  it("Should not allow contribute to non-existing campaign", async function () {
    const { invoiceFund, contributor1 } = await deployFixture();

    await expect(
      invoiceFund.connect(contributor1).contribute(999, { value: ethers.parseEther("0.1") })
    ).to.be.reverted;
  });
});
