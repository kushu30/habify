import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { keccak256, toBytes, parseEther } from 'viem';

// ABIs
import habitManagerAbi from '/home/kushagra/Desktop/Coding/projects/habify/habify-contracts/abi/HabitManager.json';

// Define the Type for our Struct
type HabitChallengeType = readonly [
  boolean,      // isActive
  number,       // streak
  bigint,       // stakeAmount
  `0x${string}`, // habitHash
  bigint,       // startTime
  bigint,       // duration
  bigint        // lastCheckInTime
];

// Get contract address and define stake amount in ETH
const habitManagerAddress = import.meta.env.VITE_HABIT_MANAGER_CONTRACT_ADDRESS as `0x${string}`;
const STAKE_AMOUNT = parseEther("0.005"); // This is 0.005 ETH

export const useHabitContract = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: activeChallengeData, refetch } = useReadContract({
    address: habitManagerAddress,
    abi: habitManagerAbi.abi,
    functionName: 'activeChallenges',
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  // Simplified startChallenge function for ETH staking
  const startChallenge = async (habit: string, duration: number) => {
    if (!address) throw new Error("Wallet not connected");

    try {
      console.log(`Staking ${STAKE_AMOUNT} wei...`);
      const habitHash = keccak256(toBytes(habit));

      const stakeHash = await writeContractAsync({
        address: habitManagerAddress,
        abi: habitManagerAbi.abi,
        functionName: 'stake',
        args: [habitHash, duration],
        value: STAKE_AMOUNT, // This is how we send ETH with the transaction
      });

      console.log("Stake transaction sent:", stakeHash);
      return { stakeHash };

    } catch (error) {
      console.error("Failed to start challenge:", error);
      throw error;
    }
  };

  // The checkIn function remains the same
  const checkIn = async () => {
    console.log("Checking in...");
    try {
      const hash = await writeContractAsync({
        address: habitManagerAddress,
        abi: habitManagerAbi.abi,
        functionName: 'checkIn',
        args: [],
      });
      console.log("Check-in transaction sent:", hash);
      return hash;
    } catch (error) {
      console.error("Check-in failed:", error);
      throw error;
    }
  };

  return {
    activeChallenge: activeChallengeData as HabitChallengeType | undefined,
    startChallenge,
    checkIn,
    refetchChallenge: refetch,
  };
};