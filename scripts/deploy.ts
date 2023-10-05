import { ethers } from "hardhat";

async function main() {
  // const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const unlockTime = currentTimestampInSeconds + 60;

  // const lockedAmount = ethers.parseEther("0.001");

  // Generate the MerkleRoot.
  const merkleRoot = "0xf07c2a1b9afd7096e73df6eaaa0f7aa7d3f3498f716a96b1e9616cde35586f52"

  const airdrop = await ethers.deployContract("MerkleAirdrop", [merkleRoot]);

  await airdrop.waitForDeployment();

  console.log(
    `MerkleAirdrop contract deployed to ${airdrop.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
