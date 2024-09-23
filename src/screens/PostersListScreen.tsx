import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import UserContext from '../context/UserContext';
import auth from '@react-native-firebase/auth';
import { useIsFocused } from '@react-navigation/native';

const PostersListScreen = ({ route, navigation }) => {
  const { selectedCategory, selectedCategoryId, tableName } = route.params;
  const [posters, setPosters] = useState([]);
  const [filteredPosters, setFilteredPosters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [contactBar, setContactBar] = useState('');
  const [watermark, setWatermark] = useState('');
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const { user } = useContext(UserContext);
  const isFocused = useIsFocused(); // Hook to detect if screen is focused

  useEffect(() => {
    const fetchPostersAndSubscriptionStatus = async () => {
      try {
        setLoading(true); // Start loading

        // Refresh the ID token
        const idToken = await auth().currentUser?.getIdToken(true);
        console.log('Retrieved ID token:', idToken);

        if (!idToken) {
          throw new Error('Failed to retrieve ID token');
        }

        // Fetch the posters list from the API
        const postersResponse = await fetch('https://oneclickbranding.ai/fetch_posters_list.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache', // Prevent caching
            'Pragma': 'no-cache', // HTTP 1.0 compatibility
            'Expires': '0', // Ensure response is not cached
          },
          body: new URLSearchParams({
            idToken: idToken,
            tableName: tableName,
          }).toString(),
        });

        const postersData = await postersResponse.json();
        console.log('Posters response:', postersData);

        if (postersData.success) {
          setPosters(postersData.posters);
          setFilteredPosters(postersData.posters); // Initially, all posters are shown
        } else {
          console.error('Error fetching posters:', postersData.message);
        }

        // Fetch the latest subscription status from the API
        const subscriptionResponse = await fetch('https://oneclickbranding.ai/subscription_status.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache', // Prevent caching
            'Pragma': 'no-cache', // HTTP 1.0 compatibility
            'Expires': '0', // Ensure response is not cached
          },
          body: new URLSearchParams({
            idToken: idToken,
            categoryId: selectedCategoryId,
          }).toString(),
        });

        const subscriptionData = await subscriptionResponse.json();
        console.log('Subscription status response:', subscriptionData);

        if (subscriptionData.success) {
          setIsSubscribed(subscriptionData.isSubscribed);
          setContactBar(subscriptionData.contactbar || 'yourfirmcontactbartaxprofessional.png');
          setWatermark(subscriptionData.watermark || 'OneClick Branding');
        } else {
          console.error('Error fetching subscription status:', subscriptionData.message);
        }
      } catch (error) {
        console.error('Error fetching posters or subscription status:', error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    if (isFocused) {
      fetchPostersAndSubscriptionStatus(); // Fetch data when the screen is focused
    }
  }, [isFocused, selectedCategoryId, tableName]); // Add isFocused to the dependency array

  const handlePosterPress = (posterImageName) => {
    const posterImageUrl = isSubscribed
      ? `https://oneclickbranding.ai/posters/paid/${posterImageName}`
      : `https://oneclickbranding.ai/posters/notpaid/${posterImageName}`;

    const contactBarImageUrl = isSubscribed
      ? `https://practiceguru.pro/images/${contactBar}`
      : `https://practiceguru.pro/images/yourfirmcontactbartaxprofessional.png`;

    navigation.navigate('ImageShareScreen', {
      posterImageUrl: posterImageUrl,
      selectedCategory: selectedCategory,
      selectedCategoryId: selectedCategoryId,
      idToken: user.idToken,
      contactBarImageUrl: contactBarImageUrl,
      watermarkText: watermark,
      isSubscribed: isSubscribed, 
    });
  };

  const handleSearch = (text) => {
    setSearchQuery(text);

    if (text) {
      const filtered = posters.filter(poster =>
        poster.description.toLowerCase().includes(text.toLowerCase()) ||
        poster.keywords.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPosters(filtered);
    } else {
      setFilteredPosters(posters); // Reset to all posters if search query is empty
    }
  };

  const renderPosterItem = ({ item }) => {
    const posterImageUrl = isSubscribed
      ? `https://oneclickbranding.ai/posters/paid/${item.poster_image_url}`
      : `https://oneclickbranding.ai/posters/notpaid/${item.poster_image_url}`;

    return (
      <TouchableOpacity style={styles.posterContainer} onPress={() => handlePosterPress(item.poster_image_url)}>
        <Image source={{ uri: posterImageUrl }} style={styles.posterImage} />
        <Text style={styles.posterName}>{item.poster_name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search posters..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <FlatList
            data={filteredPosters}
            keyExtractor={item => item.id.toString()}
            renderItem={renderPosterItem}
            ListEmptyComponent={() => <Text>No posters available</Text>}
            numColumns={2} // Display 2 posters per row
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
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

export default PostersListScreen;
