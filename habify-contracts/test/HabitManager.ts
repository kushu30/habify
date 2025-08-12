import { ethers } from "hardhat";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { HabitManager, HabitStreakNFT, MockUSDC } from "../typechain-types";

describe("HabitManager", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployFixtures() {
    // Get signers (test accounts)
    const [owner, user1, user2, trustedForwarder]: HardhatEthersSigner[] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    const token: MockUSDC = await MockUSDCFactory.deploy();
    
    // Deploy HabitStreakNFT, with HabitManager as the eventual owner
    const HabitStreakNFTFactory = await ethers.getContractFactory("HabitStreakNFT");
    const nft: HabitStreakNFT = await HabitStreakNFTFactory.deploy(owner.address);

    // Deploy HabitManager
    const HabitManagerFactory = await ethers.getContractFactory("HabitManager");
    const habitManager: HabitManager = await HabitManagerFactory.deploy(
      await token.getAddress(),
      await nft.getAddress(),
      await trustedForwarder.getAddress()
    );

    // Transfer ownership of the NFT contract to the HabitManager contract
    await nft.transferOwnership(await habitManager.getAddress());
    
    // Prepare for tests: Mint tokens to users and approve the HabitManager to spend them
    const STAKE_AMOUNT = await habitManager.STAKE_AMOUNT();
    await token.mint(user1.address, STAKE_AMOUNT);
    await token.mint(user2.address, STAKE_AMOUNT);
    
    await token.connect(user1).approve(await habitManager.getAddress(), STAKE_AMOUNT);
    await token.connect(user2).approve(await habitManager.getAddress(), STAKE_AMOUNT);


    return { habitManager, nft, token, owner, user1, user2, STAKE_AMOUNT };
  }

  // First Test Case: Staking
  it("should allow a user to stake and start a habit", async function () {
    const { habitManager, user1, STAKE_AMOUNT } = await deployFixtures();
    const habitHash = ethers.id("Read 10 pages a day");
    
    await expect(habitManager.connect(user1).stake(habitHash, 7))
      .to.emit(habitManager, "ChallengeStarted")
      .withArgs(user1.address, habitHash, 7, STAKE_AMOUNT);

    const challenge = await habitManager.activeChallenges(user1.address);
    expect(challenge.isActive).to.be.true;
    expect(challenge.habitHash).to.equal(habitHash);
  });

  it("should allow a user to check in within the valid window", async function () {
    const { habitManager, user1 } = await deployFixtures();
    const habitHash = ethers.id("test habit");
    await habitManager.connect(user1).stake(habitHash, 7);

    // We use a helper to advance the blockchain's time
    await time.increase(25 * 60 * 60); // 25 hours

    await expect(habitManager.connect(user1).checkIn())
      .to.emit(habitManager, "CheckedIn");

    const challenge = await habitManager.activeChallenges(user1.address);
    expect(challenge.streak).to.equal(1);
  });

  it("should revert if a user tries to check in too early", async function () {
    const { habitManager, user1 } = await deployFixtures();
    const habitHash = ethers.id("test habit");
    await habitManager.connect(user1).stake(habitHash, 7);

    // Only advance time by a few minutes
    await time.increase(5 * 60); // 5 minutes

    await expect(habitManager.connect(user1).checkIn())
      .to.be.revertedWith("Too early to check in");
  });

  it("should forfeit the challenge if a user checks in too late", async function () {
    const { habitManager, token, user1, STAKE_AMOUNT } = await deployFixtures();
    const habitHash = ethers.id("test habit");
    await habitManager.connect(user1).stake(habitHash, 7);

    // Advance time past the 48-hour window
    await time.increase(49 * 60 * 60); // 49 hours
    
    await expect(habitManager.connect(user1).checkIn())
      .to.emit(habitManager, "ChallengeFailed")
      .withArgs(user1.address, habitHash);
      
    const challenge = await habitManager.activeChallenges(user1.address);
    expect(challenge.isActive).to.be.false;

    // Check that the stake was moved to the forfeited pool
    expect(await habitManager.forfeitedPool()).to.equal(STAKE_AMOUNT);
  });

  it("should award an NFT when a user reaches a milestone", async function () {
    const { habitManager, nft, user1 } = await deployFixtures();
    const habitHash = ethers.id("test habit");
    await habitManager.connect(user1).stake(habitHash, 7);

    // Calculate the expected token ID that will be minted
    const streakMilestone = 3;
    const expectedTokenId = BigInt(user1.address) + BigInt(streakMilestone);

    // Simulate checking in for 3 consecutive days
    for (let i = 1; i <= streakMilestone; i++) {
      await time.increase(25 * 60 * 60); // Advance 25 hours
      
      const checkInTx = habitManager.connect(user1).checkIn();

      // On the final check-in, expect the Transfer event with the correct tokenId
      if (i === streakMilestone) {
        await expect(checkInTx)
          .to.emit(nft, "Transfer")
          .withArgs(ethers.ZeroAddress, user1.address, expectedTokenId);
      } else {
        await checkInTx;
      }
    }

    const challenge = await habitManager.activeChallenges(user1.address);
    expect(challenge.streak).to.equal(streakMilestone);
  });

  it("should allow a user to claim their reward after completion", async function () {
    const { habitManager, token, user1, STAKE_AMOUNT } = await deployFixtures();
    const habitHash = ethers.id("test habit");
    const DURATION = 7; // 7 days
    await habitManager.connect(user1).stake(habitHash, DURATION);

    const initialBalance = await token.balanceOf(user1.address);
    expect(initialBalance).to.equal(0); // Balance is 0 after staking

    // Advance time past the challenge duration
    await time.increase(DURATION * 24 * 60 * 60);

    await expect(habitManager.connect(user1).claimReward())
      .to.emit(habitManager, "RewardClaimed");

    // Check that the stake was returned to the user
    const finalBalance = await token.balanceOf(user1.address);
    expect(finalBalance).to.equal(STAKE_AMOUNT);
    
    // Check that the challenge is no longer active
    const challenge = await habitManager.activeChallenges(user1.address);
    expect(challenge.isActive).to.be.false;
  });


});