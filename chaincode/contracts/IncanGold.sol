// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IncanGold
 * @dev A smart contract to manage the funds for an Incan Gold game.
 * It acts as an escrow, holding player entry fees and distributing winnings
 * based on results provided by a trusted backend (the contract owner).
 */
contract IncanGold {
    // === STATE VARIABLES ===

    address public owner;
    uint256 public entryFee; // The cost to join a game, in wei
    uint256 public nextGameId;

    // A struct to hold all data for a single game session
    struct Game {
        address[] players;
        mapping(address => bool) hasJoined;
        uint256 pot;
        bool isActive;
    }

    // A mapping from gameId to the Game struct
    mapping(uint256 => Game) public games;

    // === EVENTS ===
    // Events are crucial for the frontend/backend to listen to on-chain activities
    event GameCreated(uint256 indexed gameId, uint256 entryFee);
    event PlayerJoined(uint256 indexed gameId, address indexed player);
    event GameSettled(uint256 indexed gameId, address[] winners, uint256[] payouts);

    // === MODIFIERS ===
    // Modifiers are reusable code that can be attached to functions to check certain conditions
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    // === CONSTRUCTOR ===
    // This runs only once when the contract is deployed
    constructor(uint256 _entryFee) {
        owner = msg.sender;
        entryFee = _entryFee; // e.g., 1000000000000000000 for 1 ETH
        nextGameId = 1;
    }

    // === CORE FUNCTIONS ===

    /**
     * @dev Allows a player to join the current active game by paying the entry fee.
     * If no active game exists, it creates one.
     */
    function joinGame() public payable {
        // The player must send exactly the entry fee
        require(msg.value == entryFee, "Incorrect entry fee sent");

        uint256 currentGameId = nextGameId - 1;
        Game storage currentGame = games[currentGameId];

        // If no game is active or the last game was settled, create a new one.
        if (!currentGame.isActive || currentGame.players.length >= 5) { // Max 5 players in Incan Gold
            currentGameId = nextGameId;
            currentGame = games[currentGameId];
            currentGame.isActive = true;
            nextGameId++;
            emit GameCreated(currentGameId, entryFee);
        }

        // Prevent a player from joining the same game twice
        require(!currentGame.hasJoined[msg.sender], "Player has already joined this game");

        // Add player to the game
        currentGame.players.push(msg.sender);
        currentGame.hasJoined[msg.sender] = true;
        currentGame.pot += msg.value;

        emit PlayerJoined(currentGameId, msg.sender);
    }

    /**
     * @dev Settles an active game. Can only be called by the owner (the backend).
     * The backend calculates the winners and payout amounts and calls this function.
     * @param _gameId The ID of the game to settle.
     * @param _winners An array of the winner addresses.
     * @param _payouts An array of payout amounts in wei, corresponding to each winner.
     */
    function settleGame(uint256 _gameId, address[] memory _winners, uint256[] memory _payouts) public onlyOwner {
        Game storage game = games[_gameId];
        require(game.isActive, "Game is not active or does not exist");
        require(_winners.length == _payouts.length, "Winners and payouts array length mismatch");

        uint256 totalPayout = 0;
        for (uint i = 0; i < _payouts.length; i++) {
            totalPayout += _payouts[i];
        }

        // Ensure the contract doesn't pay out more than it holds in the pot
        require(totalPayout <= game.pot, "Total payout exceeds the game pot");

        // Transfer winnings to each winner
        for (uint i = 0; i < _winners.length; i++) {
            // .transfer() is a simple way to send Ether
            payable(_winners[i]).transfer(_payouts[i]);
        }

        // Mark the game as settled
        game.isActive = false;
        // The pot is now empty because the funds were transferred out
        game.pot = 0;

        emit GameSettled(_gameId, _winners, _payouts);
    }

    // === HELPER / VIEW FUNCTIONS ===

    /**
     * @dev Returns the list of players for a given game.
     */
    function getPlayers(uint256 _gameId) public view returns (address[] memory) {
        return games[_gameId].players;
    }

    /**
     * @dev Returns the pot amount for a given game.
     */
    function getPot(uint256 _gameId) public view returns (uint256) {
        return games[_gameId].pot;
    }
}
