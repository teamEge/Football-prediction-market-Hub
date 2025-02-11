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
    function finishMatch(uint256 index) external;
}

contract FootballData is IFootballData {
    Match[] public matches;
    address public oracle;

    // Constructor that sets the oracle address
    constructor(address _oracle) {
        oracle = _oracle;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can perform this action");
        _;
    }

    // Function to add a new match
    function addMatch(string memory homeTeam, string memory awayTeam, string memory score, uint256 endTime) public override onlyOracle {
        matches.push(Match(homeTeam, awayTeam, score, false, endTime));
    }

    // Function to update the score of a match
    function updateScore(uint256 index, string memory newScore) public override onlyOracle {
        require(index < matches.length, "Match does not exist");
        require(!matches[index].isFinished, "Match is already finished");
        matches[index].score = newScore;
    }

    // Function to mark a match as finished
    function finishMatch(uint256 index) public override onlyOracle {
        require(index < matches.length, "Match does not exist");
        matches[index].isFinished = true;
    }

    // Function to retrieve all matches
    function getMatches() public view override returns (Match[] memory) {
        return matches;
    }
}
