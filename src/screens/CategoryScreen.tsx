import React, { useEffect, useContext, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import UserContext from '../context/UserContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';

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
        console.log('User ID Token:', user.idToken);

        const response = await fetch('https://oneclickbranding.ai/newsubscriptiondetails.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: user.idToken,
          }),
        });

        const data = await response.text();
        console.log('Raw response:', data);

        const jsonData = JSON.parse(data.trim());
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
  }, [isFocused, user.idToken]); // Re-fetch when the screen is focused

  const handleCategoryPress = (category) => {
    navigation.navigate('PostersTypesScreen', {
      selectedCategory: category,
      idToken: user.idToken,
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
    <View style={styles.container}>
      <Text style={styles.title}>Subscribed Categories</Text>
      {subscribedCategories.length > 0 ? (
        <FlatList
          data={subscribedCategories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleCategoryPress(item)}>
              <View style={styles.categoryContainer}>
                <Text style={styles.info}><Text style={styles.boldText}>Category:</Text> {item.category_name}</Text>
                <Text style={styles.info}><Text style={styles.boldText}>Start Date:</Text> {item.start_date}</Text>
                <Text style={styles.info}><Text style={styles.boldText}>End Date:</Text> {item.end_date}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text>No subscriptions yet.</Text>
      )}

      <Text style={styles.title}>Non-Subscribed Categories</Text>
      {nonSubscribedCategories.length > 0 ? (
        <FlatList
          data={nonSubscribedCategories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleCategoryPress(item)}>
              <View style={styles.categoryContainer}>
                <Text style={styles.info}>{item.category_name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text>All categories are subscribed.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
});

export default CategoryScreen;
