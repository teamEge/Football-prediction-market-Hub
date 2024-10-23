// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.26;

contract FootballData{

    struct Match{
    string homeTeam;
    string awayTeam;
    string score;
    bool isFinished;
    uint256 endTime;
    }
    
    
    Match[] public matches;
    address public oracle;

        constructor() {
        oracle = msg.sender;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can perform this action");
        _;
    }

        function addMatch(string memory homeTeam,string memory awayTeam,string memory score, uint256 endTime) public onlyOracle{
            matches.push(Match(homeTeam, awayTeam, score, false, endTime));
        }


        function updateScore(uint256 index, string memory newScore) public onlyOracle{
            require(index < matches.length, "Match does not exist");


            matches[index].score = newScore;
        }


        function finishMatches(uint256 index) public onlyOracle{
            require(index < matches.length, "Match does not exist");

            matches[index].isFinished = true;

        }


        function getMatches() public view returns(Match[] memory){
            return matches;
        }
        
     
}