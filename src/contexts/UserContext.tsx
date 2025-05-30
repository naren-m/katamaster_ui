import { createContext, useState, useContext, ReactNode } from 'react';
import { sampleData } from '../data/sampleData';

type UserContextType = {
  isParentMode: boolean;
  toggleUserMode: () => void;
  childName: string;
  childAvatar: string;
  setChildName: (name: string) => void;
  setChildAvatar: (avatar: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isParentMode, setIsParentMode] = useState(false);
  const [childName, setChildName] = useState(sampleData.child.name);
  const [childAvatar, setChildAvatar] = useState(sampleData.child.avatar);

  const toggleUserMode = () => {
    setIsParentMode(!isParentMode);
  };

  return (
    <UserContext.Provider value={{
      isParentMode,
      toggleUserMode,
      childName,
      childAvatar,
      setChildName,
      setChildAvatar
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};