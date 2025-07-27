import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Award, 
  Calendar, 
  Settings, 
  User, 
  UserCog,
  CalendarDays,
  LogOut,
  BookOpen,
  Activity,
  Video
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
        ? 'bg-orange-500 text-white transform scale-110 shadow-lg' 
        : 'text-blue-900 hover:bg-orange-100'
    }`}
  >
    <div className="text-2xl mb-1">{icon}</div>
    <span className="text-xs font-bold">{label}</span>
  </Link>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isParentMode, toggleUserMode } = useUser();
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  const kidNavLinks = [
    { to: '/', icon: <Home size={24} />, label: 'Home' },
    { to: '/video-practice', icon: <Video size={24} />, label: 'Video' },
    { to: '/kata-reference', icon: <BookOpen size={24} />, label: 'Kata' },
    { to: '/rewards', icon: <Award size={24} />, label: 'Rewards' },
    { to: '/history', icon: <Calendar size={24} />, label: 'History' }
  ];
  
  const parentNavLinks = [
    { to: '/parent', icon: <Home size={24} />, label: 'Dashboard' },
    { to: '/video-practice', icon: <Video size={24} />, label: 'Video' },
    { to: '/kata-reference', icon: <BookOpen size={24} />, label: 'Kata' },
    { to: '/rewards', icon: <Award size={24} />, label: 'Rewards' },
    { to: '/history', icon: <Calendar size={24} />, label: 'History' },
    { to: '/calendar', icon: <CalendarDays size={24} />, label: 'Calendar' },
    { to: '/settings', icon: <Settings size={24} />, label: 'Settings' }
  ];
  
  const navLinks = isParentMode ? parentNavLinks : kidNavLinks;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <span className="text-xl font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            {isParentMode ? 'Parent Dashboard' : 'Karate Kid Practice'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Welcome, {user?.name}!</span>
          <button
            onClick={toggleUserMode}
            className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all shadow-lg"
            aria-label={isParentMode ? "Switch to Kid Mode" : "Switch to Parent Mode"}
          >
            {isParentMode ? <User size={20} /> : <UserCog size={20} />}
          </button>
          <button
            onClick={() => signOut()}
            className="p-2 bg-red-500 bg-opacity-80 rounded-full text-white hover:bg-red-600 transition-all shadow-lg"
            aria-label="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
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