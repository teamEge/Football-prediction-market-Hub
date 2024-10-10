// test/FootballData.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FootballData Contract", function () {
    let FootballData;
    let footballData;
    let owner;
    let addr1;

    beforeEach(async function () {
        // Kontratı dağıt ve oracle (sahip) olarak owner'ı ata
        [owner, addr1] = await ethers.getSigners();
        FootballData = await ethers.getContractFactory("FootballData");
        footballData = await FootballData.deploy();
    });

    it("should add a match correctly", async function () {
        // Maç ekleme işlemi, sadece oracle (sahip) tarafından yapılabilir
        await footballData.addMatch("Team A", "Team B", 1692556800);

        const matches = await footballData.getMatches();
        expect(matches.length).to.equal(1);
        expect(matches[0].homeTeam).to.equal("Team A");
        expect(matches[0].awayTeam).to.equal("Team B");
        expect(matches[0].score).to.equal("0-0");
        expect(matches[0].isFinished).to.be.false;
        expect(matches[0].endTime).to.equal(1692556800);
    });

    it("should not allow non-oracle to add a match", async function () {
        // Oracle olmayan bir kullanıcı maç eklemeye çalıştığında hata vermeli
        await expect(
            footballData.connect(addr1).addMatch("Team A", "Team B", 1692556800)
        ).to.be.revertedWith("Only oracle can perform this action");
    });

    it("should update the score of a match correctly", async function () {
        await footballData.addMatch("Team A", "Team B", 1692556800);
        await footballData.updateScore(0, "1-2");

        const matches = await footballData.getMatches();
        expect(matches[0].score).to.equal("1-2");
    });

    it("should not allow non-oracle to update the score", async function () {
        await footballData.addMatch("Team A", "Team B", 1692556800);
        // Oracle olmayan biri skoru güncellemeye çalışırsa hata vermeli
        await expect(
            footballData.connect(addr1).updateScore(0, "1-2")
        ).to.be.revertedWith("Only oracle can perform this action");
    });

    it("should not allow updating a non-existent match", async function () {
        // Mevcut olmayan bir maç skoru güncellenmeye çalışılırsa hata vermeli
        await expect(
            footballData.updateScore(0, "1-0")
        ).to.be.revertedWith("Match does not exist");
    });

    it("should finish a match correctly", async function () {
        await footballData.addMatch("Team A", "Team B", 1692556800);
        await footballData.finishMatches(0);

        const matches = await footballData.getMatches();
        expect(matches[0].isFinished).to.be.true;
    });

    it("should not allow non-oracle to finish a match", async function () {
        await footballData.addMatch("Team A", "Team B", 1692556800);
        // Oracle olmayan birisi maçı bitirmeye çalışırsa hata vermeli
        await expect(
            footballData.connect(addr1).finishMatches(0)
        ).to.be.revertedWith("Only oracle can perform this action");
    });

    it("should not allow updating score of a finished match", async function () {
        await footballData.addMatch("Team A", "Team B", 1692556800);
        await footballData.finishMatches(0);

        // Bitmiş maçın skoru güncellenmeye çalışılırsa hata vermeli
        await expect(
            footballData.updateScore(0, "2-2")
        ).to.be.revertedWith("Match is already finished");
    });
});
