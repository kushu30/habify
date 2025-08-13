// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "./HabitStreakNFT.sol";

contract HabitManager is ERC2771Context {
    event ChallengeStarted(address indexed user, bytes32 indexed habitHash, uint256 duration, uint256 stakeAmount);
    event CheckedIn(address indexed user, uint256 newStreak, uint256 checkInTime);
    event ChallengeFailed(address indexed user, bytes32 habitHash);
    event RewardClaimed(address indexed user, uint256 stakeReturned, uint256 bonusReward);
    event NFTAwarded(address indexed user, uint256 milestone);

    struct HabitChallenge {
        bool isActive;
        uint16 streak;
        uint256 stakeAmount;
        bytes32 habitHash;
        uint256 startTime;
        uint256 duration;
        uint256 lastCheckInTime;
    }

    HabitStreakNFT public immutable nftContract;
    uint256 public constant STAKE_AMOUNT = 0.005 ether;
    uint256 public constant CHECKIN_WINDOW = 24 hours;

    mapping(address => HabitChallenge) public activeChallenges;
    mapping(uint16 => bool) public isMilestone;
    mapping(address => mapping(uint16 => bool)) public hasBeenAwardedNFT;

    uint256 public forfeitedPool;
    uint256 public successfulCompletions;

    constructor(
        address _nftContractAddress,
        address _trustedForwarder
    ) ERC2771Context(_trustedForwarder) {
        nftContract = HabitStreakNFT(_nftContractAddress);
        isMilestone[3] = true;
        isMilestone[7] = true;
        isMilestone[14] = true;
    }

    function stake(bytes32 _habitHash, uint256 _duration) external payable {
        require(!activeChallenges[_msgSender()].isActive, "User already has an active challenge");
        require(_duration == 7 || _duration == 30, "Invalid duration");
        require(msg.value == STAKE_AMOUNT, "Incorrect stake amount sent");

        activeChallenges[_msgSender()] = HabitChallenge({
            isActive: true,
            streak: 0,
            stakeAmount: msg.value,
            habitHash: _habitHash,
            startTime: block.timestamp,
            duration: _duration,
            lastCheckInTime: block.timestamp
        });

        emit ChallengeStarted(_msgSender(), _habitHash, _duration, msg.value);
    }

    function checkIn() external {
        HabitChallenge storage challenge = activeChallenges[_msgSender()];
        require(challenge.isActive, "No active challenge");

        if (block.timestamp > challenge.lastCheckInTime + (CHECKIN_WINDOW * 2)) {
            _forfeit(_msgSender());
            return;
        }

        require(block.timestamp >= challenge.lastCheckInTime + CHECKIN_WINDOW, "Too early to check in");

        challenge.lastCheckInTime = block.timestamp;
        challenge.streak++;

        _checkAndMintNFT(_msgSender(), challenge.streak);

        emit CheckedIn(_msgSender(), challenge.streak, block.timestamp);
    }

    function claimReward() external {
        HabitChallenge storage challenge = activeChallenges[_msgSender()];
        require(challenge.isActive, "No active challenge");
        require(block.timestamp >= challenge.startTime + (challenge.duration * 1 days), "Challenge not yet complete");

        uint256 bonus = 0;
        if (forfeitedPool > 0 && successfulCompletions > 0) {
            bonus = forfeitedPool / successfulCompletions;
        }
        successfulCompletions++;
        if (bonus > forfeitedPool) {
          bonus = forfeitedPool;
        }
        forfeitedPool -= bonus;

        uint256 amountToReturn = challenge.stakeAmount + bonus;
        payable(_msgSender()).transfer(amountToReturn);

        delete activeChallenges[_msgSender()];
        emit RewardClaimed(_msgSender(), challenge.stakeAmount, bonus);
    }

    function _forfeit(address _user) private {
        HabitChallenge storage challenge = activeChallenges[_user];
        bytes32 habitHash = challenge.habitHash;
        forfeitedPool += challenge.stakeAmount;
        delete activeChallenges[_user];
        emit ChallengeFailed(_user, habitHash);
    }

    function _checkAndMintNFT(address _user, uint16 _streak) private {
        if (isMilestone[_streak] && !hasBeenAwardedNFT[_user][_streak]) {
            hasBeenAwardedNFT[_user][_streak] = true;
            uint256 tokenId = uint256(uint160(_user)) + _streak;
            nftContract.safeMint(_user, tokenId);
            emit NFTAwarded(_user, _streak);
        }
    }

    function _msgSender() internal view override(ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }
}