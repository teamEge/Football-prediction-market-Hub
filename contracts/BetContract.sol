// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./FootballData.sol"; // FootballData'yı doğru şekilde import ettik

contract BetContract {
    enum Prediction { HomeWin, AwayWin, Draw }

    struct Bet {
        uint256 amount;
        Prediction prediction;
    }

    struct MatchBets {
        uint256 totalHomeWin;
        uint256 totalAwayWin;
        uint256 totalDraw;
        mapping(address => Bet) userBets;
        address[] usersWithBets;
        bool isPaidOut;
    }

    IFootballData public footballDataContract;
    address public oracle;
    address public commissionAddress;
    mapping(uint256 => MatchBets) public matchBets;

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can perform this action");
        _;
    }

    constructor(address _footballDataContract, address _commissionAddress) {
        footballDataContract = IFootballData(_footballDataContract);
        oracle = msg.sender;
        commissionAddress = _commissionAddress;
    }

    function setCommissionAddress(address _commissionAddress) external onlyOracle {
        commissionAddress = _commissionAddress;
    }

    function placeBet(uint256 matchIndex, Prediction _prediction) external payable {
        require(msg.value > 0, "Bet amount must be greater than zero.");
        IFootballData.Match[] memory matches = footballDataContract.getMatches();
        require(matchIndex < matches.length, "Invalid match index.");
        require(!matches[matchIndex].isFinished, "Match already finished.");

        MatchBets storage matchBet = matchBets[matchIndex];
        Bet storage userBet = matchBet.userBets[msg.sender];

        require(userBet.amount == 0, "You have already placed a bet.");

        userBet.amount = msg.value;
        userBet.prediction = _prediction;

        matchBet.usersWithBets.push(msg.sender);

        if (_prediction == Prediction.HomeWin) {
            matchBet.totalHomeWin += msg.value;
        } else if (_prediction == Prediction.AwayWin) {
            matchBet.totalAwayWin += msg.value;
        } else {
            matchBet.totalDraw += msg.value;
        }

        uint256 commission = (msg.value * 1) / 1000; // %0.1 komisyon
        payable(commissionAddress).transfer(commission);
    }

    function distributeRewards(uint256 matchIndex) external onlyOracle {
        IFootballData.Match[] memory matches = footballDataContract.getMatches();
        require(matchIndex < matches.length, "Invalid match index.");
        require(matches[matchIndex].isFinished, "Match is not finished.");

        MatchBets storage matchBet = matchBets[matchIndex];
        require(!matchBet.isPaidOut, "Rewards already distributed.");

        string memory result = matches[matchIndex].score;
        Prediction winningPrediction;

        if (keccak256(bytes(result)) == keccak256(bytes("HomeWin"))) {
            winningPrediction = Prediction.HomeWin;
        } else if (keccak256(bytes(result)) == keccak256(bytes("AwayWin"))) {
            winningPrediction = Prediction.AwayWin;
        } else {
            winningPrediction = Prediction.Draw;
        }

        uint256 winningPool;
        if (winningPrediction == Prediction.HomeWin) {
            winningPool = matchBet.totalHomeWin;
        } else if (winningPrediction == Prediction.AwayWin) {
            winningPool = matchBet.totalAwayWin;
        } else {
            winningPool = matchBet.totalDraw;
        }

        require(winningPool > 0, "No bets placed on winning outcome.");

        uint256 totalPool = matchBet.totalHomeWin + matchBet.totalAwayWin + matchBet.totalDraw;

        for (uint256 i = 0; i < matchBet.usersWithBets.length; i++) {
            address user = matchBet.usersWithBets[i];
            Bet storage userBet = matchBet.userBets[user];
            if (userBet.prediction == winningPrediction) {
                uint256 reward = userBet.amount + (userBet.amount * (totalPool - winningPool) / winningPool);
                payable(user).transfer(reward);
            }
        }

        matchBet.isPaidOut = true;
    }
}
