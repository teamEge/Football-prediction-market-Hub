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
uint256 public matchCount;

function addMatch(uint256 matchId, string memory homeTeam,string memory awayTeam, uint256 endTime) public{
 
    matches.push(Match(matchId, homeTeam, awayTeam, "0-0", false, endTime));
       matchCount++;
}

}