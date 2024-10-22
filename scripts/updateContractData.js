const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractABI = require('./artifacts/contracts/FootballData.sol/FootballData.json');
const contractAddress = process.env.CONTRACT_ADDRESS;

const contract = new ethers.Contract(contractAddress, contractABI, wallet);

async function updateContractData(matchData) {
    try {
        for (const match of matchData) {
            const { matchId, homeTeam, awayTeam, score, isFinished, endTime } = match;

            if (matchId == null) {
                const tx = await contract.addMatch(homeTeam, awayTeam, endTime);
                console.log(`New match added with teams ${homeTeam} vs ${awayTeam}. Transaction Hash: ${tx.hash}`);
                const receipt = await tx.wait();
                console.log(`Match added in block ${receipt.blockNumber}`);
            } else {
                const txUpdateScore = await contract.updateScore(matchId, score);
                console.log(`Match ID: ${matchId} updated with score: ${score}. Transaction Hash: ${txUpdateScore.hash}`);
                await txUpdateScore.wait();

                if (isFinished) {
                    const txFinishMatch = await contract.finishMatches(matchId);
                    console.log(`Match ID: ${matchId} marked as finished. Transaction Hash: ${txFinishMatch.hash}`);
                    await txFinishMatch.wait();
                }
            }
        }
    } catch (error) {
        console.error('UpdateContractDataError', error);
    }
}

module.exports = { updateContractData };
