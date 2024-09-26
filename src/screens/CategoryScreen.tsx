import React, { useEffect, useContext, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import UserContext from '../context/UserContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import auth from '@react-native-firebase/auth'; // Import Firebase Auth

const CategoryScreen = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook to detect if screen is focused
  const [subscribedCategories, setSubscribedCategories] = useState([]);
  const [nonSubscribedCategories, setNonSubscribedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Refresh the idToken
        const idToken = await auth().currentUser?.getIdToken(true);
        console.log('Retrieved ID token:', idToken); // Debugging: Log the ID token

        if (!idToken) {
          throw new Error('Failed to retrieve ID token');
        }

        console.log('Attempting to fetch new subscription details');

        const response = await fetch('https://oneclickbranding.ai/newsubscriptiondetails.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`, // Use the refreshed ID token
            'Cache-Control': 'no-cache', // Prevent caching
            'Pragma': 'no-cache', // HTTP 1.0 compatibility
            'Expires': '0', // Ensure response is not cached
          },
          body: JSON.stringify({
            idToken: idToken, // Send the ID token as a JSON object
          }),
        });

        const data = await response.text();
        console.log('Raw response:', data);

        const jsonData = JSON.parse(data.trim());
        console.log('Parsed JSON:', jsonData); // Debugging: Log the parsed JSON

        if (jsonData.success) {
          setSubscribedCategories(jsonData.subscribed_categories);
          setNonSubscribedCategories(jsonData.non_subscribed_categories);
        } else {
          Alert.alert('Error', jsonData.message || 'Failed to fetch categories.');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', 'Something went wrong while fetching categories.');
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      setLoading(true); // Reset loading state when refetching
      fetchCategories(); // Fetch data when the screen is focused
    }
  }, [isFocused]); // Re-fetch when the screen is focused

  const handleCategoryPress = (category) => {
    navigation.navigate('PostersTypesScreen', {
      selectedCategory: category,
      idToken: user.idToken, // Pass the ID token to the next screen
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.sectionContainer}>
        <Text style={styles.title}>Subscribed Categories</Text>
        {subscribedCategories.length > 0 ? (
          subscribedCategories.map((item) => (
            <TouchableOpacity key={item.id.toString()} onPress={() => handleCategoryPress(item)}>
              <View style={styles.categoryContainer}>
                <Text style={styles.info}><Text style={styles.boldText}>Category:</Text> {item.category_name}</Text>
                <Text style={styles.info}><Text style={styles.boldText}>Start Date:</Text> {item.start_date}</Text>
                <Text style={styles.info}><Text style={styles.boldText}>End Date:</Text> {item.end_date}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No subscriptions yet.</Text>
        )}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.title}>Non-Subscribed Categories</Text>
        {nonSubscribedCategories.length > 0 ? (
          nonSubscribedCategories.map((item) => (
            <TouchableOpacity key={item.id.toString()} onPress={() => handleCategoryPress(item)}>
              <View style={styles.categoryContainerTwoColumns}>
                <Text style={styles.info}>{item.category_name}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text>All categories are subscribed.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
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
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
  },
  categoryContainerTwoColumns: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 10, // Add horizontal margin for spacing between columns
    borderRadius: 10,
    elevation: 2,
    flex: 1, // Make sure the container takes up equal space
  },
});

export default CategoryScreen;
