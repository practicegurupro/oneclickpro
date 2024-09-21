import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import UserContext from '../context/UserContext';

const PostersListScreen = ({ route, navigation }) => {
  const { selectedCategory, selectedCategoryId, tableName, idToken } = route.params;
  const [posters, setPosters] = useState([]);
  const [filteredPosters, setFilteredPosters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [contactBar, setContactBar] = useState('');
  const [watermark, setWatermark] = useState('');
  const { user } = useContext(UserContext);

  useEffect(() => {
    // Fetch the posters list from the API
    fetch('https://oneclickbranding.ai/fetch_posters_list.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        idToken: idToken,
        tableName: tableName,
      }).toString(),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setPosters(data.posters);
          setFilteredPosters(data.posters); // Initially, all posters are shown
        } else {
          console.error('Error fetching posters:', data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });

    // Fetch the latest subscription status from the API
    fetch('https://oneclickbranding.ai/subscription_status.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        idToken: idToken,
        categoryId: selectedCategoryId,
      }).toString(),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setIsSubscribed(data.isSubscribed);
          setContactBar(data.contactbar || 'yourfirmcontactbartaxprofessional.png');
          setWatermark(data.watermark || 'OneClick Branding');
        } else {
          console.error('Error fetching subscription status:', data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, [idToken, selectedCategoryId, tableName]);

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
      watermarkText: watermark
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
