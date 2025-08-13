import { useReadContract } from 'wagmi';
import habitManagerAbi from '/home/kushagra/Desktop/Coding/projects/habify/habify-contracts/abi/HabitManager.json';

// Define the type for our HabitChallenge struct for type safety
type HabitChallengeType = readonly [
  boolean,      // isActive
  number,       // streak
  bigint,       // stakeAmount
  `0x${string}`, // habitHash
  bigint,       // startTime
  bigint,       // duration
  bigint        // lastCheckInTime
];

// Get the contract address from our environment variables
const habitManagerAddress = import.meta.env.VITE_HABIT_MANAGER_CONTRACT_ADDRESS as `0x${string}`;

// The component takes the friend's address and a function to remove them
export const FriendRow = ({ address, onRemove }: { address: string, onRemove: (address: string) => void }) => {
  const { data: challengeData, isLoading } = useReadContract({
    address: habitManagerAddress,
    abi: habitManagerAbi.abi,
    functionName: 'activeChallenges',
    args: [address as `0x${string}`], // Fetch data for the friend's address
  });

  const challenge = challengeData as HabitChallengeType | undefined;
  const isActive = challenge?.[0] ?? false;
  const streak = challenge?.[1] ?? 0;
  const duration = challenge?.[5] ?? 0;

  return (
    <li className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <div className="flex-grow">
        <p className="font-mono text-sm truncate" title={address}>{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</p>
        {isLoading ? (
          <p className="text-xs text-gray-500">Loading on-chain data...</p>
        ) : isActive ? (
          <p className="text-xs text-secondary">{`Streak: ${streak} days (${(Number(streak) / Number(duration) * 100).toFixed(0)}%)`}</p>
        ) : (
          <p className="text-xs text-gray-400">No active habit</p>
        )}
      </div>
      <button onClick={() => onRemove(address)} className="text-red-500 hover:text-red-700 font-bold ml-4">✕</button>
    </li>
  );
};