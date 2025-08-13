import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // We still use the deployer's address as a placeholder for the Biconomy forwarder
  const trustedForwarderAddress = deployer.address;
  console.log("Using deployer's address as the Trusted Forwarder:", trustedForwarderAddress);

  // 1. Deploy HabitStreakNFT
  const habitNFT = await ethers.deployContract("HabitStreakNFT", [
    deployer.address,
  ]);
  await habitNFT.waitForDeployment();
  console.log(`✅ HabitStreakNFT deployed to: ${habitNFT.target}`);

  // 2. Deploy the updated HabitManager
  const habitManager = await ethers.deployContract("HabitManager", [
    habitNFT.target,
    trustedForwarderAddress,
  ]);
  await habitManager.waitForDeployment();
  console.log(`✅ HabitManager deployed to: ${habitManager.target}`);

  // 3. Transfer ownership of the NFT contract to the HabitManager
  console.log("\nTransferring ownership of HabitStreakNFT to HabitManager...");
  const tx = await habitNFT.transferOwnership(habitManager.target);
  await tx.wait();
  console.log("✅ Ownership transferred successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});