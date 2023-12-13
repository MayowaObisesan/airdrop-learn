import MerkleTree from "merkletreejs";
// import { keccak256 } from "ethers/lib/utils";
import csv from "csv-parser";
import * as fs from "fs";
import { keccak256, solidityPackedSha256 } from "ethers";
import path from "path";
import { AirDropData } from "./interface";

//This might not be used

export interface AddressProof {
    leaf: string;
    proof: string[];
}

const csvfile = path.join(__dirname, "./data/data.csv");

async function generateMerkleTree(csvFilePath: string): Promise<void> {
    const data: AirDropData[] = [];

    // Read the CSV file and store the data in an array
    await new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on("data", (row: AirDropData) => {
                data.push(row);
            })
            .on("end", resolve)
            .on("error", reject);
    });
    let leaf: string;
    let leaves: string[] = [];
    // Hash the data using the Solidity keccak256 function
    for (const row of data) {
        // console.log(Object.values(row)[0]);
        leaf = solidityPackedSha256(
            ["address", "uint256"],
            [Object.values(row)[0], row.amount]
        );
        // console.log(leaf);
        leaves.push(leaf);
    }

    // Create the Merkle tree
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const addressProofs: { [address: string]: AddressProof } = {};
    data.forEach((row, index) => {
        const proof = tree.getProof(leaves[index]);
        addressProofs[Object.values(row)[0]] = {
            leaf: "0x" + leaves[index].toString(),
            proof: proof.map((p) => "0x" + p.data.toString("hex")),
        };
    });

    // Write the Merkle tree and root to a file
    await new Promise<void>((resolve, reject) => {
        fs.writeFile("merkle_tree.json", JSON.stringify(addressProofs), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    // Write a JSON object mapping addresses to data to a file
    const addressData: { [address: string]: AirDropData } = {};
    data.forEach((row) => {
        addressData[row.address] = row;
    });

    await new Promise<void>((resolve, reject) => {
        fs.writeFile("address_data.json", JSON.stringify(addressData), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
    console.log("0x" + tree.getRoot().toString("hex"));
}

generateMerkleTree(csvfile).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});