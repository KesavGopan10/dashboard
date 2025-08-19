import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const SettingsPage: React.FC = () => {
  const { user, showToast } = useContext(AppContext);
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
  });

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <p className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-800">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <p className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-800">{user.email}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <p className="w-full p-3 border rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed">{user.role}</p>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
            <div className="flex items-center gap-4">
                <img src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=A4F44A&color=2D7A79&bold=true`} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                <button type="button" onClick={() => showToast('Feature coming soon!')} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">Change</button>
            </div>
          </div>
        </div>
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