import { useState } from 'react';
import { useHabitContract } from '../hooks/useHabitContract';
import { keccak256, toBytes, hexToString } from 'viem';

// This is a helper function to decode the habit name from bytes32
// Note: This is a simple implementation and may not work for all strings.
const decodeHabitName = (habitHash: `0x${string}`) => {
  try {
    // This is a simplification; in a real app, you'd store the string off-chain
    // and retrieve it based on the hash. For now, we'll show the hash.
    return `Habit Hash: ${habitHash.substring(0, 10)}...`;
  } catch (e) {
    return "Unknown Habit";
  }
};


export const Dashboard = () => {
  const { activeChallenge, checkIn, refetchChallenge } = useHabitContract();
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  if (!activeChallenge || !activeChallenge[0]) {
    return <div className="text-center mt-12">Loading challenge data...</div>;
  }
  
  const [_isActive, streak, _stakeAmount, habitHash, _startTime, duration, _lastCheckInTime] = activeChallenge;

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      alert("Please confirm the check-in transaction in your wallet.");
      await checkIn();
      alert("Check-in successful!");
      await refetchChallenge();
    } catch (error) {
      console.error(error);
      alert("Check-in failed. Are you too early? Check console for details.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const progress = (Number(streak) / Number(duration)) * 100;

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-dark-surface rounded-xl shadow-lg mt-8 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white break-words">{decodeHabitName(habitHash)}</h2>

      <div>
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-primary dark:text-white">Progress</span>
          <span className="text-sm font-medium text-primary dark:text-white">{`${Number(streak)} / ${Number(duration)} Days`}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300">Current Streak</p>
        <p className="text-5xl font-bold text-secondary">{Number(streak)} 🔥</p>
      </div>

      <button
        onClick={handleCheckIn}
        disabled={isCheckingIn}
        className="w-full bg-primary hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-400"
      >
        {isCheckingIn ? 'Processing...' : 'Check In for Today'}
      </button>
    </div>
  );
};