import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Settings, User, Bell, Shield } from 'lucide-react';

const SettingsPage = () => {
  const { childName, setChildName, childAvatar, setChildAvatar } = useUser();
  const [localChildName, setLocalChildName] = useState(childName);
  const [notifications, setNotifications] = useState(true);
  const [parentalControls, setParentalControls] = useState(true);
  const [rewardPointThreshold, setRewardPointThreshold] = useState(50);
  
  const handleSaveChanges = () => {
    setChildName(localChildName);
    // Other settings would be saved here
    alert('Settings saved successfully!');
  };
  
  return (
    <div className="max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Settings
      </h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button className="px-6 py-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600 focus:outline-none">
              General Settings
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {/* Child Profile Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <User size={20} className="mr-2 text-blue-600" />
                Child Profile
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
                    Child's Name
                  </label>
                  <input
                    type="text"
                    id="childName"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={localChildName}
                    onChange={(e) => setLocalChildName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['ninja-boy', 'ninja-girl', 'karate-kid', 'sensei'].map((avatar) => (
                      <div 
                        key={avatar}
                        className={`p-2 border rounded-md cursor-pointer ${
                          childAvatar === avatar ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setChildAvatar(avatar)}
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                          {avatar.split('-')[0].charAt(0).toUpperCase()}
                        </div>
                        <p className="text-xs text-center mt-1">{avatar.replace('-', ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <Bell size={20} className="mr-2 text-blue-600" />
                Notification Settings
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Practice Reminders</p>
                    <p className="text-xs text-gray-500">Send daily reminders to practice</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full">
                    <input 
                      type="checkbox" 
                      id="toggle-practice" 
                      className="sr-only" 
                      checked={notifications}
                      onChange={() => setNotifications(!notifications)}
                    />
                    <label 
                      htmlFor="toggle-practice" 
                      className={`absolute inset-0 rounded-full cursor-pointer transition-colors ${
                        notifications ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span 
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          notifications ? 'transform translate-x-6' : ''
                        }`} 
                      />
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Reward Notifications</p>
                    <p className="text-xs text-gray-500">Notify when new rewards are available</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full">
                    <input 
                      type="checkbox" 
                      id="toggle-rewards" 
                      className="sr-only" 
                      checked={true}
                      onChange={() => {}}
                    />
                    <label 
                      htmlFor="toggle-rewards" 
                      className="absolute inset-0 bg-blue-600 rounded-full cursor-pointer"
                    >
                      <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transform translate-x-6" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Reward Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <Settings size={20} className="mr-2 text-blue-600" />
                Reward Settings
              </h2>
              
              <div>
                <label htmlFor="pointThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Points for Small Rewards
                </label>
                <input
                  type="number"
                  id="pointThreshold"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={rewardPointThreshold}
                  onChange={(e) => setRewardPointThreshold(parseInt(e.target.value) || 0)}
                  min="10"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This sets the minimum point threshold for small rewards like ice cream
                </p>
              </div>
            </div>
            
            {/* Parental Controls */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <Shield size={20} className="mr-2 text-blue-600" />
                Parental Controls
              </h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Require Approval for Rewards</p>
                  <p className="text-xs text-gray-500">All rewards require parent approval before redemption</p>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full">
                  <input 
                    type="checkbox" 
                    id="toggle-parental" 
                    className="sr-only" 
                    checked={parentalControls}
                    onChange={() => setParentalControls(!parentalControls)}
                  />
                  <label 
                    htmlFor="toggle-parental" 
                    className={`absolute inset-0 rounded-full cursor-pointer transition-colors ${
                      parentalControls ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span 
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        parentalControls ? 'transform translate-x-6' : ''
                      }`} 
                    />
                  </label>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveChanges}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;