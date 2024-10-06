import React, { useEffect, useContext, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import UserContext from '../context/UserContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

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
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
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
          console.log('Subscribed Categories:', jsonData.subscribed_categories);
          console.log('Non-Subscribed Categories:', jsonData.non_subscribed_categories);
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
  }, [isFocused]);

  const handleCategoryPress = (category) => {
    const isSubscribed = subscribedCategories.some((sub) => sub.id === category.id); // Check if category is in the subscribed list
  
    navigation.navigate('PostersTypesScreen', {
      selectedCategory: category, // Sends the selected category object
      idToken: user.idToken, // Sends the user's ID token
      isSubscribed, // Sends whether the user is subscribed to the category
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
      {/* Subscribed Categories Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.title}>Subscribed Categories</Text>
        <View style={styles.categoryGrid}>
          {subscribedCategories.length > 0 ? (
            subscribedCategories.map((item) => (
              <TouchableOpacity key={item.id.toString()} onPress={() => handleCategoryPress(item)} style={styles.column}>
                <View style={styles.categoryContainerTwoColumns}>
                  {item.iconurl && (
                    <>
                      <Image source={{ uri: item.iconurl }} style={styles.iconImage} />
                     
                    </>
                  )}
                  {/* <Text style={styles.info}>{item.category_name}</Text> */}
                  <Text style={styles.info}><Text style={styles.boldText}>Expiry:</Text> {item.end_date}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No subscriptions yet.</Text>
          )}
        </View>
      </View>

      {/* Non-Subscribed Categories Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.title}>Non-Subscribed Categories</Text>
        <View style={styles.categoryGrid}>
          {nonSubscribedCategories.length > 0 ? (
            nonSubscribedCategories.map((item) => (
              <TouchableOpacity key={item.id.toString()} onPress={() => handleCategoryPress(item)} style={styles.column}>
                <View style={styles.categoryContainerTwoColumns}>
                  {item.iconurl && (
                    <>
                      <Image source={{ uri: item.iconurl }} style={styles.iconImage} />
                    
                    </>
                  )}
                  <Text style={styles.info}>{item.category_name}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text>All categories are subscribed.</Text>
          )}
        </View>
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
  categoryContainerTwoColumns: {
    backgroundColor: '#fff',
    padding: 5,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    elevation: 2,
    flex: 1,
    alignItems: 'center', // Center the icon
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  column: {
    flexBasis: '48%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});

export default CategoryScreen;
