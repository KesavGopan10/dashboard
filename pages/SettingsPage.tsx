import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

type ProfileData = Pick<User, 'name' | 'email'>;

const SettingsPage: React.FC = () => {
  const { user, showToast, updateUserProfile } = useContext(AppContext);
  
  const [profile, setProfile] = useState<ProfileData>({ 
    name: user?.name || '', 
    email: user?.email || '' 
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const hasProfileChanges = useMemo(() => {
    if (!user) return false;
    return profile.name !== user.name || profile.email !== user.email;
  }, [profile, user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  
  const handleResetProfile = () => {
      if (user) {
          setProfile({ name: user.name, email: user.email });
      }
  }

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasProfileChanges || !user) return;
    
    setIsSubmitting(true);
    try {
        await updateUserProfile({ name: profile.name, email: profile.email });
        showToast('Profile updated successfully!');
    } catch (error) {
        showToast('Failed to update profile.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving notification settings:', notifications);
    showToast('Notification settings saved successfully!');
  };


  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Profile Settings</h3>
        <form className="space-y-6" onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Full Name</label>
              <input type="text" id="name" name="name" value={profile.name} onChange={handleProfileChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A79] bg-gray-50 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" value={profile.email} onChange={handleProfileChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A79] bg-gray-50 text-gray-900" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input type="text" value={user.role} readOnly className="w-full p-3 border rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
            <div className="flex items-center gap-4">
                <img src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=A4F44A&color=2D7A79&bold=true`} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                <button type="button" onClick={() => showToast('Feature coming soon!')} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">Change</button>
            </div>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button type="button" onClick={handleResetProfile} disabled={!hasProfileChanges || isSubmitting} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Reset</button>
            <button type="submit" disabled={!hasProfileChanges || isSubmitting} className="px-6 py-2 rounded-lg text-white bg-[#2D7A79] hover:bg-opacity-90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Notification Settings</h3>
        <form className="space-y-6" onSubmit={handleNotificationsSubmit}>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-medium text-gray-800">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Get emails to find out what's going on.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="email" checked={notifications.email} onChange={handleNotificationChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2D7A79]"></div>
                </label>
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-medium text-gray-800">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Get push notifications on your phone.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="push" checked={notifications.push} onChange={handleNotificationChange} className="sr-only peer"/>
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2D7A79]"></div>
                </label>
            </div>
            <div className="pt-4 flex justify-end">
                <button type="submit" className="px-6 py-2 rounded-lg text-white bg-[#2D7A79] hover:bg-opacity-90 font-semibold">Save Changes</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;