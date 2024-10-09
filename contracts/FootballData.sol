// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.27;

contract FootballData{
    struct Match{
    uint256 matchId;
    string homeTeam;
    string awayTeam;
    string score;
    bool isFinished;
    uint256 endTime;
    }
    
    Match[] public matches;

        function addMatch(uint256 matchId, string memory homeTeam,string memory awayTeam, uint256 endTime) public{
            matches.push(Match(matchId, homeTeam, awayTeam, "0-0", false, endTime));
        }


        function updateScore(uint256 index, string memory newScore) public{
            require(index < matches.length, "Match does not exist");
            require(!matches[index].isFinished, "Match is already finishedd");

            matches[index].score = newScore;
        }


        function getMatches() public view returns(Match[] memory){
            return matches;
        }
}