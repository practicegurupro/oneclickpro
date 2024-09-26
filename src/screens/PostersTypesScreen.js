import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import UserContext from '../context/UserContext';
import auth from '@react-native-firebase/auth';

const PostersTypesScreen = ({ route, navigation }) => {
  const { selectedCategory } = route.params; // Get the selected category from the previous screen
  const [posterTypes, setPosterTypes] = useState([]);
  const [loading, setLoading] = useState(true); // State for managing loading
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchPosterTypes = async () => {
      try {
        // Refresh the idToken
        const idToken = await auth().currentUser?.getIdToken(true);
        console.log('Retrieved ID token:', idToken);

        if (!idToken) {
          throw new Error('Failed to retrieve ID token');
        }

        // Fetch the poster types from the API
        const response = await fetch('https://oneclickbranding.ai/fetch_posters_types.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache', // Prevent caching
            'Pragma': 'no-cache', // HTTP 1.0 compatibility
            'Expires': '0', // Ensure response is not cached
          },
          body: new URLSearchParams({
            idToken: idToken,
          }).toString(),
        });

        const data = await response.json();
        console.log('Raw response:', data);

        if (data.success) {
          setPosterTypes(data.poster_types);
        } else {
          console.error('Error fetching poster types:', data.message);
        }
      } catch (error) {
        console.error('Error fetching poster types:', error);
      } finally {
        setLoading(false); // Set loading to false once the data is fetched
      }
    };

    fetchPosterTypes(); // Fetch data on component mount
  }, []);

  // Ensure that selectedCategory is a string
  const categoryName = typeof selectedCategory === 'object' ? selectedCategory.category_name : selectedCategory;

  const handlePosterTypePress = (posterType) => {
    // Extract category_name from the selectedCategory object
    const categoryName = selectedCategory.category_name;
    const categoryId = selectedCategory.id;

    // Log the categoryId to see if it's being extracted correctly
    console.log('Extracted categoryId:', categoryId);

    if (!categoryName || typeof categoryName !== 'string') {
      console.error('Invalid categoryName:', categoryName);
      return;
    }

    let tableName;
    if (posterType === 'Marketing Posters') {
      // Use the main category table based on the selected category
      tableName = `${categoryName.toLowerCase().replace(/\s+/g, '_')}_posters`;
    } else {
      // Convert the poster type name to a table name
      tableName = `${posterType.toLowerCase().replace(/\s+/g, '_')}`;
    }

    console.log('Navigating to PostersListScreen with:', {
      tableName: tableName,
      selectedCategory: categoryName,
      selectedCategoryId: categoryId,
      posterType: posterType,
      idToken: user.idToken
    });

    navigation.navigate('PostersListScreen', {
      tableName: tableName,
      selectedCategory: categoryName,
      selectedCategoryId: categoryId,
      posterType: posterType,
      idToken: user.idToken // Pass the ID token
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.categoryTitle}>{categoryName}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" /> // Loader displayed while fetching data
      ) : (
        <FlatList
          data={posterTypes}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.box}
              onPress={() => handlePosterTypePress(item.poster_type_name)}
            >
              <Text style={styles.boxText}>{item.poster_type_name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => <Text>No poster types available</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  box: {
    backgroundColor: '#ddd',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  boxText: {
    fontSize: 18,
  },
});

export default PostersTypesScreen;
