// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IFootballData {
    struct Match {
        string homeTeam;
        string awayTeam;
        string score;
        bool isFinished;
        uint256 endTime;
    }

    function getMatches() external view returns (Match[] memory);
    function addMatch(string memory homeTeam, string memory awayTeam, string memory score, uint256 endTime) external;
    function updateScore(uint256 index, string memory newScore) external;
    function finishMatches(uint256 index) external;
}

contract FootballData is IFootballData {
    Match[] public matches;
    address public oracle;

    constructor() {
        oracle = msg.sender;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can perform this action");
        _;
    }

    // Bu fonksiyon match eklemek için
    function addMatch(string memory homeTeam, string memory awayTeam, string memory score, uint256 endTime) public override onlyOracle {
        matches.push(Match(homeTeam, awayTeam, score, false, endTime));
    }

    // Bu fonksiyon skor güncellemek için
    function updateScore(uint256 index, string memory newScore) public override onlyOracle {
        require(index < matches.length, "Match does not exist");
        require(!matches[index].isFinished, "Match is already finished");
        matches[index].score = newScore;
    }

    // Bu fonksiyon maçı bitirmek için
    function finishMatches(uint256 index) public override onlyOracle {
        require(index < matches.length, "Match does not exist");
        matches[index].isFinished = true;
    }

    // Bu fonksiyon maçları almak için
    function getMatches() public view override returns(Match[] memory) {
        return matches;
    }
}
