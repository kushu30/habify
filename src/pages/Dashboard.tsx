export const Dashboard = () => {
  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-dark-surface rounded-xl shadow-lg mt-8 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Habit: Drink 2L Water Daily</h2>

      <div>
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-primary dark:text-white">Progress</span>
          <span className="text-sm font-medium text-primary dark:text-white">4/7 Days</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-primary h-2.5 rounded-full" style={{ width: '57%' }}></div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300">Current Streak</p>
        <p className="text-5xl font-bold text-secondary">4 🔥</p>
      </div>

      <button className="w-full bg-primary hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
        Check In for Today
      </button>
    </div>
  );
};