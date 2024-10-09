// test/FootballData.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FootballData Contract", function () {
    let FootballData;
    let footballData;
    let owner;

    beforeEach(async function () {
        // Kontratı dağıt
        FootballData = await ethers.getContractFactory("FootballData");
        footballData = await FootballData.deploy();

    });

    it("should add a match correctly", async function () {
        await footballData.addMatch(1, "Team A", "Team B", 1692556800);
        
        const matches = await footballData.getMatches();
        expect(matches.length).to.equal(1);
        expect(matches[0].matchId).to.equal(1);
        expect(matches[0].homeTeam).to.equal("Team A");
        expect(matches[0].awayTeam).to.equal("Team B");
        expect(matches[0].score).to.equal("0-0");
        expect(matches[0].isFinished).to.be.false;
        expect(matches[0].endTime).to.equal(1692556800);
    });

    it("should update the score of a match correctly", async function () {
        await footballData.addMatch(1, "Team A", "Team B", 1692556800);
        await footballData.updateScore(0, "1-2");

        const matches = await footballData.getMatches();
        expect(matches[0].score).to.equal("1-2");
    });

    it("should not allow updating a non-existent match", async function () {
        await expect(footballData.updateScore(0, "1-0")).to.be.revertedWith("Match does not exist");
    });
});
