import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import auth from '@react-native-firebase/auth'; // Import Firebase Auth
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
  const [loading, setLoading] = useState(true); // State for managing loading
  const [error, setError] = useState(null); // State for handling errors

  const fetchProfileData = async () => {
    setLoading(true); // Set loading state to true
    setError(null); // Reset error state

    try {
      // Refresh the idToken
      const idToken = await auth().currentUser?.getIdToken(true);
      console.log('Retrieved ID token:', idToken); // Debugging: Log the ID token

      if (!idToken) {
        throw new Error('Failed to retrieve ID token');
      }

      // Make the API request with the refreshed token
      const response = await fetch('https://oneclickbranding.ai/latestsubscription.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          idToken, // Send the ID token as a JSON object
        }),
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText); // Debugging: Log the raw response

      const data = JSON.parse(responseText.trim());
      console.log('Parsed JSON:', data); // Debugging: Log the parsed JSON

      if (data.success) {
        setProfileData({
          email: data.email,
          createdAt: data.created_at,
          contactbar: data.contactbar,
          subscribedCategories: data.subscribed_categories,
        });
      } else {
        throw new Error(data.message || 'Failed to fetch profile data.');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError(error.message); // Set error message
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchProfileData(); // Fetch data when the screen is focused
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.info}>Loading...</Text>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {String(error)}</Text> {/* Ensure error is converted to string */}
          <Button title="Retry" onPress={fetchProfileData} /> {/* Retry button to refetch data */}
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Basic Details</Text>
            <Text style={styles.info}><Text style={styles.boldText}>Email:</Text> {profileData.email}</Text>
            <Text style={styles.info}><Text style={styles.boldText}>Account Created At:</Text> {profileData.createdAt}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Subscribed Categories</Text>
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
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5', // Light background for contrast
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  categoryContainer: {
    marginBottom: 10,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 16,
  },
});

export default Profile;
