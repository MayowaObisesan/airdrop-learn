import MerkleTree from "merkletreejs";
// import { keccak256 } from "ethers/lib/utils";
import csv from "csv-parser";
import * as fs from "fs";
import { keccak256, solidityPackedSha256 } from "ethers";
import path from "path";
import { Data } from "./hashData";
import { generateElectionCSV, getPath } from "./utils";
import { AddressProof } from "./generateProof";

interface ElectionData {
    address: string;
    hash: string;
    electionId: number;
}

const csvfile = path.join(__dirname, "userdata/data.csv");


function main() {
    let root;

    ///files for each ardrop
    // import distribution from this file
    // const filename = "gen_files/dropTicket/kinship_drop_tickets.csv";

    // what file should we write the merkel proofs too?
    const output_file = "scripts/data/data.json";

    //file that has the user claim list
    const userclaimFile = "scripts/data/claimlist.json";

    //contract of items being sent out
    const airdropContract = "0x027Ffd3c119567e85998f4E6B9c3d83D5702660c";

    // used to store one leaf for each line in the distribution file
    const tokenDist: Data[] = [];

    // used for tracking user_id of each leaf so we can write to proofs file accordingly
    const userDistList = [];

    fs.createReadStream(csvfile)
        .pipe(csv())
        .on("data", (row) => {
            const user_dist = [row["user_address"], row["itemID"], row["amount"]]; // create record to track user_id of leaves
            const leaf_hash = solidityPackedSha256(
                ["address", "uint256"],
                [row["address"], row["amount"]]
            ); // encode base data like solidity abi.encode
            userDistList.push(user_dist); // add record to index tracker
            tokenDist.push(leaf_hash); // add leaf hash to distribution
        })
        .on("end", () => {
            // create merkle tree from token distribution
            const merkle_tree = new MerkleTree(tokenDist, keccak256, {
                sortPairs: true,
            });
            // get root of our tree
            root = merkle_tree.getHexRoot();
            // create proof file
            write_leaves(merkle_tree, userDistList, tokenDist, root);
        });

    // write leaves & proofs to json file
    function write_leaves(merkle_tree, userDistList, tokenDist, root) {
        console.log("Begin writing leaves to file...");
        full_dist = {};
        full_user_claim = {};
        for (line = 0; line < userDistList.length; line++) {
            // generate leaf hash from raw data
            const leaf = tokenDist[line];

            // create dist object
            const user_dist = {
                leaf: leaf,
                proof: merkle_tree.getHexProof(leaf),
            };
            // add record to our distribution
            full_dist[userDistList[line][0]] = user_dist;
        }

        fs.writeFile(output_file, JSON.stringify(full_dist, null, 4), (err) => {
            if (err) {
                console.error(err);
                return;
            }

            let dropObjs = {
                dropDetails: {
                    contractAddress: airdropContract,
                    merkleroot: root,
                },
            };

            for (line = 0; line < userDistList.length; line++) {
                const other = userDistList[line];
                // console.log(gotchi_dist_list[line])
                const user_claim = {
                    address: other[0],
                    amount: other[1],
                };
                full_user_claim[userDistList[line][0]] = user_claim;
            }
            let newObj = Object.assign(full_user_claim, dropObjs);
            //append to airdrop list to have comprehensive overview
            fs.writeFile(userclaimFile, JSON.stringify(newObj, null, 4), (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
            });
            console.log(output_file, "has been written with a root hash of:\n", root);
        });

        // return root;
    }
}


//generate an election tree given the election name and id
//will store the necessary files in a folder acccording to its name
async function generateElectionTree(
    electionId: number,
    electionName: string
): Promise<void> {
    const data: Data[] = [];
    //first generate the election csv data
    const csvFile = await generateElectionCSV(csvfile, electionName, electionId);

    // Read the CSV file and store the data in an array
    await new Promise((resolve, reject) => {
        fs.createReadStream(csvFile)
            .pipe(csv())
            .on("data", (row: Data) => {
                data.push(row);
            })
            .on("end", resolve)
            .on("error", reject);
    });
    let leaf: string;
    let leaves: string[] = [];
    // Hash the data using the Solidity keccak256 function
    for (const row of data) {
        leaf = solidityPackedSha256(
            ["address", "bytes32", "uint256"],
            [row.address, row.hash, row.amount]
        );
        leaves.push(leaf);
    }

    // Create the Merkle tree
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const addressProofs: { [address: string]: AddressProof } = {};
    data.forEach((row, index) => {
        const proof = tree.getProof(leaves[index]);
        addressProofs[row.address] = {
            leaf: "0x" + leaves[index].toString(),
            proof: proof.map((p) => "0x" + p.data.toString("hex")),
        };
    });

    // Write the Merkle tree and root to a file
    await new Promise<void>((resolve, reject) => {
        fs.writeFile(
            `${getPath(csvFile)}/tree.json`,
            JSON.stringify(addressProofs),
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });

    // Write a JSON object mapping addresses to data to a file
    const addressData: { [address: string]: Data } = {};
    data.forEach((row) => {
        addressData[row.address] = row;
    });

    await new Promise<void>((resolve, reject) => {
        fs.writeFile(
            `${getPath(csvFile)}/data.json`,
            JSON.stringify(addressData),
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
    console.log("0x" + tree.getRoot().toString("hex"));
}

generateElectionTree(0, "FUTA Staff").catch((error) => {
    console.error(error);
    process.exitCode = 1;
});