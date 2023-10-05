// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {MerkleAirdrop} from "../contracts/MerkleAirdrop.sol";
import "solmate/src/utils/MerkleProofLib.sol";

contract AirdropTest is Test {
    MerkleAirdrop public airdrop;
    bytes32 root =
        0xf07c2a1b9afd7096e73df6eaaa0f7aa7d3f3498f716a96b1e9616cde35586f52;

    address toAddress;
    bytes32[] proofs;
    uint256 claimAmount;

    struct Result {
        bytes32[] proof;
        bytes leaf;
    }

    function setUp() public {
        airdrop = new MerkleAirdrop(root);
        address user1 = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

        // Airdrop a valid user

        // toAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        // proofs = [vm.toBytes(0x0)];
        // claimAmount = 10000;

        // airdrop.claim(toAddress, claimAmount, proofs);

        string memory _root = vm.projectRoot();
        string memory path = string.concat(
            _root,
            "/scripts/data/claimData.json"
        );
        string memory json = vm.readFile(path);
        console2.logString(json);
        bytes memory res = json.parseRaw(string.concat(".", user1));

        // Result memory r = abi.decode(res, (Result));

        // console2.logBytes(r);
    }

    function testAlreadyClaimed() public {}
}
