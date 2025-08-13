import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const Friends = () => {
  const [friends, setFriends] = useLocalStorage<string[]>('habify-friends', []);
  const [newFriendAddress, setNewFriendAddress] = useState('');

  const handleAddFriend = () => {
    if (newFriendAddress && !friends.includes(newFriendAddress)) {
      // A simple check for a valid address format could be added here
      setFriends([...friends, newFriendAddress]);
      setNewFriendAddress('');
    }
  };

  const handleRemoveFriend = (addressToRemove: string) => {
    setFriends(friends.filter(friend => friend !== addressToRemove));
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-dark-surface rounded-xl shadow-lg mt-8 space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Friends</h2>

      <div className="space-y-3">
        <label className="font-semibold text-gray-700 dark:text-gray-200">Add a friend's address:</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="0x..."
            value={newFriendAddress}
            onChange={(e) => setNewFriendAddress(e.target.value)}
            className="flex-grow p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
          <button onClick={handleAddFriend} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700">Add</button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200">Your Friends List</h3>
        {friends.length > 0 ? (
          <ul className="space-y-2">
            {friends.map(friend => (
              <li key={friend} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="font-mono text-sm truncate">{friend}</p>
                <button onClick={() => handleRemoveFriend(friend)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">You haven't added any friends yet.</p>
        )}
      </div>
    </div>
  );
};