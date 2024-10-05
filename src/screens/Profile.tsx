import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform, Linking, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import auth from '@react-native-firebase/auth'; // Import Firebase Auth
import UserContext from '../context/UserContext';

const Profile = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const isFocused = useIsFocused();
  const [profileData, setProfileData] = useState({
    name: 'Unknown',
    email: 'Unknown',
    mobile: 'Unknown',
    photo: '',
    createdAt: 'Unknown',
    contactbar: 'Unknown',
    subscribedCategories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to format date as DD-MM-YYYY
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options); // 'en-GB' ensures the DD-MM-YYYY format
  };

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);

    try {
      const idToken = await auth().currentUser?.getIdToken(true);
      console.log('Retrieved ID token:', idToken);

      if (!idToken) {
        throw new Error('Failed to retrieve ID token');
      }

      const response = await fetch('https://oneclickbranding.ai/latestsubscription.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          idToken,
        }),
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      const data = JSON.parse(responseText.trim());
      console.log('Parsed JSON:', data);

      if (data.success) {
        setProfileData({
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          photo: data.photo,
          createdAt: formatDate(data.created_at), // Format account creation date
          contactbar: data.contactbar,
          subscribedCategories: data.subscribed_categories.map(category => ({
            ...category,
            start_date: formatDate(category.start_date), // Format start date
            end_date: formatDate(category.end_date), // Format end date
          })),
        });
      } else {
        throw new Error(data.message || 'Failed to fetch profile data.');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
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
      fetchProfileData();
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
            <View style={styles.photoContainer}>
              {profileData.photo ? (
                <Image 
                  source={{ uri: profileData.photo }} 
                  style={styles.profilePhoto}
                />
              ) : (
                <Text>No photo available</Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Basic Details</Text>
              <Text style={styles.info}><Text style={styles.boldText}>Name:</Text> {profileData.name}</Text>
              <Text style={styles.info}><Text style={styles.boldText}>Email:</Text> {profileData.email}</Text>
              <Text style={styles.info}><Text style={styles.boldText}>Mobile:</Text> {profileData.mobile}</Text>
              <Text style={styles.info}><Text style={styles.boldText}>Account Created At:</Text> {profileData.createdAt}</Text>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile', { profileData })}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Subscribed Categories</Text>
              {profileData.subscribedCategories.length > 0 ? (
                profileData.subscribedCategories.map((category, index) => (
                  <View key={index} style={styles.subscriptionBox}>
                    <Text style={styles.info}><Text style={styles.boldText}>Category:</Text> {category.category_name}</Text>
                    <Text style={styles.info}><Text style={styles.boldText}>Start Date:</Text> {category.start_date}</Text>
                    <Text style={styles.info}><Text style={styles.boldText}>End Date:</Text> {category.end_date}</Text>
                  </View>
                ))
              ) : (
                <Text>No categories subscribed yet.</Text>
              )}
            </View>

            {Platform.OS === 'ios' && (
              <Button title="Delete Account" color="red" onPress={handleDeleteAccount} />
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
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  subscriptionBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
