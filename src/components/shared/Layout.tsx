import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { 
  Home, 
  Award, 
  Calendar, 
  Settings, 
  User, 
  UserCog
} from 'lucide-react';

type NavLinkProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
};

const NavLink = ({ to, icon, label, active }: NavLinkProps) => (
  <Link 
    to={to}
    className={`flex flex-col items-center p-2 rounded-lg transition-all ${
      active 
        ? 'bg-orange-500 text-white transform scale-110' 
        : 'text-blue-900 hover:bg-orange-100'
    }`}
  >
    <div className="text-2xl mb-1">{icon}</div>
    <span className="text-xs font-bold">{label}</span>
  </Link>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isParentMode, toggleUserMode } = useUser();
  const location = useLocation();
  
  const kidNavLinks = [
    { to: '/', icon: <Home size={24} />, label: 'Home' },
    { to: '/rewards', icon: <Award size={24} />, label: 'Rewards' },
    { to: '/history', icon: <Calendar size={24} />, label: 'History' }
  ];
  
  const parentNavLinks = [
    { to: '/parent', icon: <Home size={24} />, label: 'Dashboard' },
    { to: '/rewards', icon: <Award size={24} />, label: 'Rewards' },
    { to: '/history', icon: <Calendar size={24} />, label: 'History' },
    { to: '/settings', icon: <Settings size={24} />, label: 'Settings' }
  ];
  
  const navLinks = isParentMode ? parentNavLinks : kidNavLinks;

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <span className="text-xl font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            {isParentMode ? 'Parent Dashboard' : 'Karate Kid Practice'}
          </span>
        </div>
        <button
          onClick={toggleUserMode}
          className="p-2 bg-orange-500 rounded-full text-white hover:bg-orange-600 transition-all"
          aria-label={isParentMode ? "Switch to Kid Mode" : "Switch to Parent Mode"}
        >
          {isParentMode ? <User size={20} /> : <UserCog size={20} />}
        </button>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow p-4 overflow-y-auto">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-2">
        <div className="max-w-screen-lg mx-auto flex justify-around">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              active={location.pathname === link.to}
            />
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;