// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "./HabitStreakNFT.sol";

contract HabitManager is ERC2771Context {
    // --- Events ---
    event ChallengeStarted(address indexed user, bytes32 indexed habitHash, uint256 duration, uint256 stakeAmount);
    event CheckedIn(address indexed user, uint256 newStreak, uint256 checkInTime);
    event ChallengeFailed(address indexed user, bytes32 habitHash);
    event RewardClaimed(address indexed user, uint256 stakeReturned, uint256 bonusReward);
    event NFTAwarded(address indexed user, uint256 milestone);

    // --- State Variables ---
    struct HabitChallenge {
        bool isActive;
        uint16 streak;
        uint256 stakeAmount;
        bytes32 habitHash;
        uint256 startTime;
        uint256 duration; // In days
        uint256 lastCheckInTime;
    }

    IERC20 public immutable stakeToken;
    HabitStreakNFT public immutable nftContract;
    uint256 public constant STAKE_AMOUNT = 5 * 1e6; // 5 USDC (assuming 6 decimals)
    uint256 public constant CHECKIN_WINDOW = 24 hours;

    mapping(address => HabitChallenge) public activeChallenges;
    mapping(uint16 => bool) public isMilestone; // e.g., 3, 7, 14 days
    mapping(address => mapping(uint16 => bool)) public hasBeenAwardedNFT;

    uint256 public forfeitedPool;
    uint256 public successfulCompletions;

    // --- Constructor ---
    constructor(
        address _stakeTokenAddress,
        address _nftContractAddress,
        address _trustedForwarder
    ) ERC2771Context(_trustedForwarder) {
        stakeToken = IERC20(_stakeTokenAddress);
        nftContract = HabitStreakNFT(_nftContractAddress);
        isMilestone[3] = true;
        isMilestone[7] = true;
        isMilestone[14] = true;
    }

    // --- Core Functions (to be implemented next) ---
    function stake(bytes32 _habitHash, uint256 _duration) external {
        // --- Inside the stake function ---
require(!activeChallenges[_msgSender()].isActive, "User already has an active challenge");
require(_duration == 7 || _duration == 30, "Invalid duration");

// Pull the stake from the user into this contract
// This requires the user to have approved the contract to spend their tokens first.
stakeToken.transferFrom(_msgSender(), address(this), STAKE_AMOUNT);

// Create and store the new challenge details
activeChallenges[_msgSender()] = HabitChallenge({
    isActive: true,
    streak: 0,
    stakeAmount: STAKE_AMOUNT,
    habitHash: _habitHash,
    startTime: block.timestamp,
    duration: _duration,
    lastCheckInTime: block.timestamp
});

emit ChallengeStarted(_msgSender(), _habitHash, _duration, STAKE_AMOUNT);
    }

    function checkIn() external {
        // --- Inside the checkIn function ---
HabitChallenge storage challenge = activeChallenges[_msgSender()];
require(challenge.isActive, "No active challenge");

// Check if the user has missed the 48-hour window for a check-in
if (block.timestamp > challenge.lastCheckInTime + (CHECKIN_WINDOW * 2)) {
    _forfeit(_msgSender());
    return;
}

// Check if the user is trying to check in too early (before 24 hours)
require(block.timestamp >= challenge.lastCheckInTime + CHECKIN_WINDOW, "Too early to check in");

// If the check-in is valid, update the state
challenge.lastCheckInTime = block.timestamp;
challenge.streak++;

// Check if the new streak qualifies for an NFT
_checkAndMintNFT(_msgSender(), challenge.streak);

emit CheckedIn(_msgSender(), challenge.streak, block.timestamp);
    }

    function claimReward() external {
    HabitChallenge storage challenge = activeChallenges[_msgSender()];
    require(challenge.isActive, "No active challenge");

    // Check that the user has completed the full duration
    require(block.timestamp >= challenge.startTime + (challenge.duration * 1 days), "Challenge not yet complete");

    uint256 bonus = 0;
    // Calculate a simple bonus reward from the forfeited pool
    if (forfeitedPool > 0 && successfulCompletions > 0) {
        bonus = forfeitedPool / successfulCompletions;
    }

    // This user is now a successful completion for future calculations
    successfulCompletions++;
    
    if (bonus > forfeitedPool) {
      bonus = forfeitedPool; // Ensure bonus doesn't exceed the pool
    }
    
    forfeitedPool -= bonus;

    // Return the user's original stake plus their bonus
    stakeToken.transfer(_msgSender(), challenge.stakeAmount + bonus);

    // Clean up the user's challenge state
    delete activeChallenges[_msgSender()];

    emit RewardClaimed(_msgSender(), challenge.stakeAmount, bonus);
}

    // --- Internal Helper Functions ---
    function _forfeit(address _user) private {
    HabitChallenge storage challenge = activeChallenges[_user];

    // Read the habitHash into a memory variable BEFORE deleting storage
    bytes32 habitHash = challenge.habitHash;
    
    // Add the user's stake to the community pool
    forfeitedPool += challenge.stakeAmount;
    
    // Now, it's safe to deactivate the challenge
    delete activeChallenges[_user];
    
    // Emit the event using the variable we saved
    emit ChallengeFailed(_user, habitHash);
}

    function _checkAndMintNFT(address _user, uint16 _streak) private {
    // Check if the streak is a milestone and if the user hasn't received this NFT yet
    if (isMilestone[_streak] && !hasBeenAwardedNFT[_user][_streak]) {
        hasBeenAwardedNFT[_user][_streak] = true;
        
        // Mint the NFT. We create a unique token ID from the user's address and streak count.
        uint256 tokenId = uint256(uint160(_user)) + _streak;
        nftContract.safeMint(_user, tokenId);
        
        emit NFTAwarded(_user, _streak);
    }
}

    // --- Gasless Transaction Support ---
    function _msgSender() internal view override(ERC2771Context) returns (address) {
            return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(ERC2771Context) returns (bytes calldata) {
            return ERC2771Context._msgData();
    }
}