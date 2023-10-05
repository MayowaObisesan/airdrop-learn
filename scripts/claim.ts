import { ethers } from "hardhat";

async function main() {
    // Generate the MerkleRoot.
    const merkleAirdropContract = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const airdrop = await ethers.getContractAt("MerkleAirdrop", merkleAirdropContract);

    // Get the signers
    const [user1] = await ethers.getSigners();

    console.log(airdrop)

    async function distributeTokenUser1() {
        console.log(await airdrop.balanceOf(user1.address));
        await airdrop.claim(
            user1.address,
            ethers.parseEther("0.0001"),
            [
                "0xab3259b2acbfa3ccede67c4f66cd402424de2e52a33630fcb84ceb0a4e2ac30f",
                "0xe0b782e241c337fea2ce51e98e9a7267e2ae9d0038db9f2233c35ddcc1745568",
                "0x0af42efb33fc8f105d4501d338575d77a332d43c0c4ccf9ee710fa40eaa1fb93"
            ]
        );
        console.log(await airdrop.balanceOf(user1.address));
    }
    distributeTokenUser1();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
