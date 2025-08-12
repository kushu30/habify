import { Header } from './Header';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-200">
      <Header />
      <main>
        <Dashboard />
      </main>
    </div>
  )
}

export default App;