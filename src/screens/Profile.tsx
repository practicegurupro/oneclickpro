import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform, Linking, TouchableOpacity, ScrollView } from 'react-native';
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // Redirect to account deletion page
            Linking.openURL('https://oneclickbranding.ai/user_account_delete_request.html');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleWhatsAppPress = () => {
    const platformMessage = Platform.OS === 'ios' 
      ? 'Hi, I am using your OneClickPro iOS app. I have a question, please contact me. Thanks.' 
      : 'Hi, I am using your OneClickPro Android app. I have a question, please contact me. Thanks.';

    const url = `https://wa.me/919136637325?text=${encodeURIComponent(platformMessage)}`;
    Linking.openURL(url).catch((err) => {
      console.error('Error opening WhatsApp:', err);
      Alert.alert('Error', 'Unable to open WhatsApp.');
    });
  };

  useEffect(() => {
    if (isFocused) {
      fetchProfileData(); // Fetch data when the screen is focused
    }
  }, [isFocused]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {loading ? (
          <Text style={styles.info}>Loading...</Text>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {String(error)}</Text> 
            <Button title="Retry" onPress={fetchProfileData} /> 
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Basic Details</Text>
              <Text style={styles.info}><Text style={styles.boldText}>Email:</Text> {profileData.email}</Text>
              <Text style={styles.info}><Text style={styles.boldText}>Account Created At:</Text> {profileData.createdAt}</Text>
            </View>

            {/* WhatsApp Button */}
            {Platform.OS === 'android' && (
              <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppPress}>
                <Text style={styles.whatsappButtonText}>Contact Us</Text>
              </TouchableOpacity>
            )}

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

            {/* Add the Delete Account button only on iOS */}
            {Platform.OS === 'ios' && (
              <Button
                title="Delete Account"
                color="red"
                onPress={handleDeleteAccount}
              />
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
  },
  container: {
    flex: 1,
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
    padding: 10,
    borderWidth: 1, // Add a border
    borderColor: '#ddd', // Light gray color for the border
    borderRadius: 8, // Slightly round the borders
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
  whatsappButton: {
    backgroundColor: '#25D366', // WhatsApp green color
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;
