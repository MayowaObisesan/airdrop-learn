// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import {ERC20} from "solmate/src/tokens/ERC20.sol";
// import {MerkleProof} from "@openzeppelin/utils/cryptography/MerkleProof.sol";
import "solmate/src/utils/MerkleProofLib.sol";

contract MerkleAirdrop is ERC20 {
    bytes32 public immutable merkleRoot;

    // Mapping of addresses who have claimed tokens
    mapping(address => bool) public hasClaimed;

    /* ERRORS */
    error AlreadyClaimed();
    error InvalidLeaf();

    // EVENTS
    event Claimed(address indexed to, uint256 amount);

    constructor(bytes32 _merkleRoot) ERC20("MAToken", "MAT", 18) {
        merkleRoot = _merkleRoot;
    }

    function claim(
        address to,
        uint256 amount,
        bytes32[] calldata proof
    ) external {
        // Throw if address has already claimed tokens
        if (hasClaimed[to]) revert AlreadyClaimed();

        // Verify merkle proof, or revert if not in tree
        bytes32 leaf = keccak256(abi.encodePacked(to, amount));
        bool isValidLeaf = MerkleProofLib.verify(proof, merkleRoot, leaf);
        if (!isValidLeaf) revert InvalidLeaf();

        // Set address to claimed
        hasClaimed[to] = true;

        // Mint tokens to address
        _mint(to, amount);

        // Emit claim event
        emit Claimed(to, amount);
    }
}
