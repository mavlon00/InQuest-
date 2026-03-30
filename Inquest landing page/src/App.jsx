import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Drive from './pages/Drive';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import SignUpPassenger from './pages/SignUpPassenger';
import SignUpDriver from './pages/SignUpDriver';

const HIDE_FOOTER_PATHS = ['/login', '/signup', '/signup/passenger', '/signup/driver'];

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const hideFooter = HIDE_FOOTER_PATHS.includes(path);

  return (
    <Router>
      <div className="min-h-screen bg-bg text-text-primary font-sans selection:bg-primary selection:text-on-primary transition-colors duration-300 flex flex-col">
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/"                element={<Home />} />
            <Route path="/drive"           element={<Drive />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/signup"          element={<SignUp />} />
            <Route path="/signup/passenger" element={<SignUpPassenger />} />
            <Route path="/signup/driver"   element={<SignUpDriver />} />
          </Routes>
        </main>

        {!hideFooter && <Footer />}
      </div>
    </Router>
  );
}
