import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import UserContext from '../context/UserContext';
import auth from '@react-native-firebase/auth';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

// Sectionwise Posters (This contains the current poster fetching functionality)
const SectionwisePosters = ({ route, navigation }) => {
  const { selectedCategory, isSubscribed } = route.params; // Get the selected category and subscription status
  const [posterTypes, setPosterTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchPosterTypes = async () => {
      try {
        const idToken = await auth().currentUser?.getIdToken(true);
        if (!idToken) {
          throw new Error('Failed to retrieve ID token');
        }

        const response = await fetch('https://oneclickbranding.ai/fetch_posters_types.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache',
          },
          body: new URLSearchParams({
            idToken: idToken,
          }).toString(),
        });

        const data = await response.json();
        if (data.success) {
          setPosterTypes(data.poster_types);
        } else {
          console.error('Error fetching poster types:', data.message);
        }
      } catch (error) {
        console.error('Error fetching poster types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosterTypes();
  }, []);

  const categoryName = typeof selectedCategory === 'object' ? selectedCategory.category_name : selectedCategory;

  const handlePosterTypePress = (posterType) => {
    const categoryName = selectedCategory.category_name;
    const categoryId = selectedCategory.id;

    let tableName;
    if (posterType === 'Marketing Posters') {
      tableName = `${categoryName.toLowerCase().replace(/\s+/g, '_')}_posters`;
    } else {
      tableName = `${posterType.toLowerCase().replace(/\s+/g, '_')}`;
    }

    navigation.navigate('PostersListScreen', {
      tableName: tableName,
      selectedCategory: categoryName,
      selectedCategoryId: categoryId,
      posterType: posterType,
      idToken: user.idToken,
      isSubscribed, // Pass subscription status
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.categoryTitle}>{categoryName}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
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

// Search Posters tab with search functionality
const SearchPosters = ({ route, navigation }) => {
  const { selectedCategory, isSubscribed } = route.params; // Get the selected category and subscription status
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contactBar, setContactBar] = useState('yourfirmcontactbartaxprofessional.png'); // Default for unsubscribed users
  const [watermark, setWatermark] = useState('OneClick Branding'); // Default for unsubscribed users
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const idToken = await auth().currentUser?.getIdToken(true);
        if (!idToken) {
          throw new Error('Failed to retrieve ID token');
        }

        // Fetch subscription status, contact bar, and watermark
        const response = await fetch('https://oneclickbranding.ai/subscription_status.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache',
          },
          body: new URLSearchParams({
            idToken: idToken,
            categoryId: selectedCategory.id,
          }).toString(),
        });

        const data = await response.json();
        if (data.success) {
          if (data.isSubscribed) {
            setContactBar(data.contactbar || 'yourfirmcontactbartaxprofessional.png');
            setWatermark(data.watermark || 'OneClick Branding');
          }
        } else {
          console.error('Error fetching subscription status:', data.message);
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      }
    };

    fetchSubscriptionStatus();
  }, [selectedCategory]);

  const handleSearch = async () => {
    try {
      setLoading(true);

      const idToken = await auth().currentUser?.getIdToken(true);
      if (!idToken) {
        throw new Error('Failed to retrieve ID token');
      }

      // Send search query and selectedCategory to the backend
      const response = await fetch('https://oneclickbranding.ai/search_posters.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
        body: new URLSearchParams({
          idToken: idToken,
          searchTerm: searchQuery,
          categoryName: selectedCategory.category_name, // Send the selected category name
        }).toString(),
      });

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.posters); // Set the search results
      } else {
        console.error('Error fetching search results:', data.message);
      }
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePosterPress = (posterImageName) => {
    const posterImageUrl = isSubscribed
      ? `https://oneclickbranding.ai/posters/paid/${posterImageName}`
      : `https://oneclickbranding.ai/posters/notpaid/${posterImageName}`;

    console.log('isSubscribed:', isSubscribed);
    console.log('Poster URL:', posterImageUrl);

    navigation.navigate('ImageShareScreen', {
      posterImageUrl: posterImageUrl,
      contactBarImageUrl: `https://practiceguru.pro/images/${contactBar}`,
      watermarkText: watermark,
      isSubscribed: isSubscribed,
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search posters..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => {
            const posterImageUrl = isSubscribed
              ? `https://oneclickbranding.ai/posters/paid/${item.poster_image_url}`
              : `https://oneclickbranding.ai/posters/notpaid/${item.poster_image_url}`;

            return (
              <TouchableOpacity
                style={styles.posterContainer}
                onPress={() => handlePosterPress(item.poster_image_url)}
              >
                <Image
                  source={{ uri: posterImageUrl }}
                  style={styles.posterImage}
                />
                <Text style={styles.posterName}>{item.poster_name}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={() => <Text>No posters found</Text>}
          numColumns={2} // Display 2 posters per row
        />
      )}
    </View>
  );
};

// Main Component with Tabs
const PostersTypesScreen = ({ route, navigation }) => {
  const { selectedCategory, isSubscribed } = route.params;

  console.log('Selected Category:', selectedCategory);
  console.log('isSubscribed passed from previous page:', isSubscribed); // Add this log for debugging

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Sectionwise Posters"
        children={() => (
          <SectionwisePosters
            route={route}
            navigation={navigation}
            isSubscribed={isSubscribed} // Pass subscription status
          />
        )}
      />
      <Tab.Screen
        name="Search Posters"
        children={() => (
          <SearchPosters
            route={route}
            navigation={navigation}
            isSubscribed={isSubscribed} // Pass subscription status
          />
        )}
      />
    </Tab.Navigator>
  );
};

export default PostersTypesScreen;

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
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: '#673ab7',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  posterContainer: {
    flex: 1,
    margin: 10,
    alignItems: 'center',
  },
  posterImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  posterName: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
  },
});
