import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    email: null,
    createdAt: null,
    contactbar: null,
    subscribedCategories: [], // Separate array for subscribed categories
    nonSubscribedCategories: [], // Separate array for non-subscribed categories
    idToken: null, // Add idToken here
  });

  // Function to load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user data from AsyncStorage:', error);
    }
  };

  // Function to save user data to AsyncStorage
  const saveUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data to AsyncStorage:', error);
    }
  };

  // Automatically load user data when the component mounts
  useEffect(() => {
    loadUserData();
  }, []);

  // Save user data to AsyncStorage whenever it changes
  useEffect(() => {
    saveUserData(user);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
