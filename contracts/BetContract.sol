// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IFootballData {
    function getMatches() external view returns (FootballData.Match[] memory);
}

contract BetContract {
    enum Prediction { HomeWin, AwayWin, Draw } // 0: HomeWin, 1: AwayWin, 2: Draw

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
    address public commissionAddress = 0x075E227344294C5EE368B0817881Af7Cf201f9a9;
    mapping(uint256 => MatchBets) public matchBets;

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can perform this action");
        _;
    }

    constructor(address _footballDataContract) {
        footballDataContract = IFootballData(_footballDataContract);
        oracle = msg.sender;
    }

    // Bahis açma fonksiyonu
    function placeBet(uint256 matchIndex, Prediction _prediction) external payable {
        require(msg.value > 0, "Bet amount must be greater than zero.");
        FootballData.Match[] memory matches = footballDataContract.getMatches(); // Burada Match dizisini alıyoruz
        require(matchIndex < matches.length, "Invalid match index.");
        require(!matches[matchIndex].isFinished, "Match already finished.");

        MatchBets storage matchBet = matchBets[matchIndex];
        Bet storage userBet = matchBet.userBets[msg.sender];
        
        require(userBet.amount == 0, "You have already placed a bet.");

        userBet.amount = msg.value;
        userBet.prediction = _prediction;

        // Kullanıcıyı bets listesine ekle
        matchBet.usersWithBets.push(msg.sender);

        if (_prediction == Prediction.HomeWin) {
            matchBet.totalHomeWin += msg.value;
        } else if (_prediction == Prediction.AwayWin) {
            matchBet.totalAwayWin += msg.value;
        } else {
            matchBet.totalDraw += msg.value;
        }

        // Komisyonu kes ve belirlenen adrese gönder
        uint256 commission = (msg.value * 1) / 1000; // %0.1 komisyon
        payable(commissionAddress).transfer(commission);
    }

    // Maç sonucunu güncelleme ve ödül dağıtımı
    function distributeRewards(uint256 matchIndex) external onlyOracle {
        FootballData.Match[] memory matches = footballDataContract.getMatches();
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

        uint256 totalPool = matchBet.totalHomeWin + matchBet.totalAwayWin + matchBet.totalDraw;

        // Kazanan havuzdaki her kullanıcıya ödeme yap
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
