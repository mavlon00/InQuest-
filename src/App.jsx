import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Drive from './pages/Drive';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

export default function App() {
  const [isDark, setIsDark] = useState(true);

  // Handle theme switching
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <Router>
      <div className="min-h-screen bg-bg text-text-primary font-sans selection:bg-primary selection:text-on-primary transition-colors duration-300 flex flex-col">
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/drive" element={<Drive />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
