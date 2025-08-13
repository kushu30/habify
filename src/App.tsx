import { Header } from './Header';
import { Dashboard } from './pages/Dashboard';
import { HabitSelection } from './pages/HabitSelection';
import { Friends } from './pages/Friends';
import { useAccount } from 'wagmi';
import { useHabitContract } from './hooks/useHabitContract';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const { isConnected } = useAccount();
  const { activeChallenge } = useHabitContract();
  const challengeIsActive = activeChallenge ? activeChallenge[0] : false;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-200">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={
              !isConnected ? <h2 className="text-center mt-12 text-xl">Please connect your wallet to continue.</h2> : 
              challengeIsActive ? <Navigate to="/dashboard" /> : <HabitSelection />
            } />
            <Route path="/dashboard" element={
              isConnected && challengeIsActive ? <Dashboard /> : <Navigate to="/" />
            } />
            <Route path="/friends" element={
              isConnected ? <Friends /> : <Navigate to="/" />
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;