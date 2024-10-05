import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import auth from '@react-native-firebase/auth';
import UserContext from '../context/UserContext';

const CustomDrawerContent = (props) => {
  const { user } = useContext(UserContext);
  const [profileData, setProfileData] = useState({
    name: 'Unknown',
    email: 'Unknown',
    photo: '',
  });

  const fetchProfileData = async () => {
    const idToken = await auth().currentUser?.getIdToken(true);
    const response = await fetch('https://oneclickbranding.ai/latestsubscription.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();
    if (data.success) {
      setProfileData({
        name: data.name,
        email: data.email,
        photo: data.photo,
      });
    }
  };

  useEffect(() => {
    // Fetch profile data initially when the component mounts
    fetchProfileData();

    // Set up listener for drawer open event
    const unsubscribe = props.navigation.addListener('drawerOpen', () => {
      fetchProfileData(); // Re-fetch profile data when the drawer opens
    });

    // Clean up the listener when the component unmounts
    return unsubscribe;
  }, [props.navigation]);

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.profileContainer}>
        {profileData.photo ? (
          <Image source={{ uri: profileData.photo }} style={styles.profileImage} />
        ) : (
          <Text>No photo available</Text>
        )}
        <Text style={styles.profileName}>{profileData.name}</Text>
        <Text style={styles.profileEmail}>{profileData.email}</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
});

export default CustomDrawerContent;
