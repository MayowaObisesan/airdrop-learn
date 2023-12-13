// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {console2, stdJson} from "forge-std/Test.sol";
import {MerkleAirdrop} from "../contracts/MerkleAirdrop.sol";
import "solmate/src/utils/MerkleProofLib.sol";
import "./Helpers.sol";

contract AirdropTest is Helpers {
    using stdJson for string;

    MerkleAirdrop public airdrop;
    bytes32 root =
        0x97912b5bcbd20e36a8e95de3b5c9c74fc98178050743916e69cc51a4cfee20a7;
    // 0x0ef0eac2f63703bd7f9f2ae62cc88dc2cb4c5ffe1eb645ac016facf70e0b74b8;
    // 0xd4cf2479c053f8b7cbc85a5497b7d18f020d28eb6910c48364eaeb026f4fedb1;
    // 0xe6d92057cdbc446dd3bd0df4e80b26b9ffebe932b9f36d258e725486ca4c7b77;
    // 0xf07c2a1b9afd7096e73df6eaaa0f7aa7d3f3498f716a96b1e9616cde35586f52;

    address userA;
    address userB;

    uint256 privKeyA;
    uint256 privKeyB;

    address user1;

    address toAddress;
    // bytes32[] proofs;
    uint256 claimAmount;

    struct ProofData {
        bytes32 leaf;
        bytes32[] proof;
    }

    struct UserData {
        address user;
        uint amount;
    }

    ProofData r;

    ProofData detail;

    UserData user;

    function decodeProofStruct(
        ProofData memory _detail
    ) internal pure returns (ProofData memory) {
        ProofData memory proofDetail;
        proofDetail.leaf = _detail.leaf;
        proofDetail.proof = _detail.proof;
        return proofDetail;
    }

    function setUp() public {
        airdrop = new MerkleAirdrop(root);
        user1 = 0x298AAA9A0822eB8117F9ea24D28c897E83415440;
        claimAmount = 600000000;

        // (userA, privKeyA) = mkaddr("USERA");
        // (userB, privKeyB) = mkaddr("USERB");

        string memory _root = vm.projectRoot();
        // string memory path = string.concat(_root, "/scripts/data/data.json");
        string memory path = string.concat(_root, "/merkle_tree.json");
        string memory addressPath = string.concat(_root, "/address_data.json");
        string memory json = vm.readFile(path);
        string memory addressJson = vm.readFile(addressPath);
        user.user = vm.parseJsonUint(
            addressJson,
            string.concat(".", vm.toString(user1), ".address")
        );
        user.amount = vm.parseJsonUint(
            addressJson,
            string.concat(".", vm.toString(user1), ".amount")
        );
        bytes memory res = json.parseRaw(
            string.concat(".", vm.toString(user1))
        );

        r = abi.decode(res, (ProofData));
        detail = decodeProofStruct(r);

        // console2.logBytes32(r.leaf[1]); // console2.logBytes(res);
        console2.logBytes32(detail.proof[0]);

        // Airdrop a valid user
        toAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        // claimAmount = 100000000;
    }

    function testClaimToken() public {
        // decodeProofStruct(_detail);
        airdrop.claim(user1, claimAmount, detail.proof);
    }
}
