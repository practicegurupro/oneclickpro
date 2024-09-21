import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { DrawerActions, useIsFocused } from '@react-navigation/native';
import UserContext from '../context/UserContext';

const Profile = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const isFocused = useIsFocused(); // Hook to detect if screen is focused
  const [profileData, setProfileData] = useState({
    email: 'Unknown',
    createdAt: 'Unknown',
    contactbar: 'Unknown',
    subscribedCategories: [],
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('https://oneclickbranding.ai/latestsubscription.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: user.idToken, // Send the ID token as a JSON object
          }),
        });

        const responseText = await response.text(); // Get raw text response
        console.log('Raw response:', responseText); // Log raw response

        try {
          const data = JSON.parse(responseText.trim()); // Attempt to parse JSON
          if (data.success) {
            setProfileData({
              email: data.email,
              createdAt: data.created_at,
              contactbar: data.contactbar,
              subscribedCategories: data.subscribed_categories,
            });
          } else {
            Alert.alert('Error', data.message || 'Failed to fetch profile data.');
          }
        } catch (jsonError) {
          console.error('JSON Parse Error:', jsonError);
          Alert.alert('Error', 'Failed to parse server response as JSON.');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        Alert.alert('Error', 'Something went wrong while fetching profile data.');
      }
    };

    if (isFocused) {
      fetchProfileData(); // Fetch data when the screen is focused
    }
  }, [isFocused, user.idToken]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>

      <Text style={styles.info}><Text style={styles.boldText}>Email:</Text> {profileData.email}</Text>
      <Text style={styles.info}><Text style={styles.boldText}>Account Created At:</Text> {profileData.createdAt}</Text>
      <Text style={styles.info}><Text style={styles.boldText}>Contactbar:</Text> {profileData.contactbar}</Text>

      <Text style={styles.title}>Subscribed Categories:</Text>
      {profileData.subscribedCategories.length > 0 ? (
        profileData.subscribedCategories.map((category, index) => (
          <View key={index} style={styles.categoryContainer}>
            <Text style={styles.info}><Text style={styles.boldText}>Category:</Text> {category.category_name}</Text>
            <Text style={styles.info}><Text style={styles.boldText}>Start Date:</Text> {category.start_date}</Text>
            <Text style={styles.info}><Text style={styles.boldText}>End Date:</Text> {category.end_date}</Text>
          </View>
        ))
      ) : (
        <Text>No categories subscribed yet.</Text>
      )}

      <Button
        title="Open Drawer"
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      />
      <Button
        title="Go to Home"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  categoryContainer: {
    marginBottom: 20,
  },
});

export default Profile;
