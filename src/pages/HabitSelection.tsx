import { useState } from 'react';
import { useHabitContract } from '../hooks/useHabitContract';

export const HabitSelection = () => {
  const [customHabit, setCustomHabit] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { startChallenge, refetchChallenge } = useHabitContract();

  const handleStartChallenge = async () => {
    const habitToStart = customHabit || selectedPreset;
    if (!habitToStart) {
      alert("Please select or create a habit.");
      return;
    }

    setIsLoading(true);
    try {
      alert("Please approve the USDC transaction in your wallet, then confirm the stake transaction.");
      await startChallenge(habitToStart, 7); // Defaulting to 7 days
      alert("Challenge started successfully! The page will now update.");
      await refetchChallenge(); // Refetch contract data to update the UI
    } catch (error) {
      console.error(error);
      alert("Failed to start challenge. Check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const presets = ["🏃 Exercise for 30 mins", "💧 Drink 2L of water", "📖 Read 10 pages"];

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-dark-surface rounded-xl shadow-lg mt-8 space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Start a New Habit</h2>
      
      <div className="space-y-3">
        <p className="font-semibold text-gray-700 dark:text-gray-200">Choose a preset:</p>
        {presets.map(preset => (
          <button 
            key={preset}
            onClick={() => { setSelectedPreset(preset); setCustomHabit(''); }}
            className={`w-full text-left p-3 rounded-lg transition-colors ${selectedPreset === preset ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <p className="font-semibold text-gray-700 dark:text-gray-200">Or create your own:</p>
        <input 
          type="text" 
          placeholder="e.g., Meditate for 10 minutes" 
          value={customHabit}
          onChange={(e) => { setCustomHabit(e.target.value); setSelectedPreset(''); }}
          className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
        />
      </div>

      <button 
        onClick={handleStartChallenge}
        disabled={isLoading || (!customHabit && !selectedPreset)}
        className="w-full bg-secondary hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Select Duration & Stake'}
      </button>
    </div>
  );
};