import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import UserContext from '../context/UserContext';

const PostersListScreen = ({ route, navigation }) => {
  const { selectedCategory, selectedCategoryId, tableName, idToken } = route.params;
  const [posters, setPosters] = useState([]);
  const { user } = useContext(UserContext);

  console.log('Extracted categoryId:', selectedCategoryId);

  useEffect(() => {
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
        } else {
          console.error('Error fetching posters:', data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, [idToken, tableName]);

  const handlePosterPress = (posterImageName) => {
    // Determine if the category is subscribed or not based on the current date and subscription end date
    const currentDate = new Date();
    const isSubscribed = user.subscribedCategories.some(category => {
      const endDate = new Date(category.end_date);
      return category.id === selectedCategoryId && endDate >= currentDate;
    });

    console.log('Category ID:', selectedCategoryId);
    console.log('Category Subscription End Date:', user.subscribedCategories.find(category => category.id === selectedCategoryId)?.end_date);
    console.log('Is Subscribed (Paid) Category:', isSubscribed);
    console.log('Poster Name:', posterImageName);

    const posterImageUrl = isSubscribed
      ? `https://oneclickbranding.ai/posters/paid/${posterImageName}`
      : `https://oneclickbranding.ai/posters/notpaid/${posterImageName}`;

    console.log('Poster Image URL:', posterImageUrl);

    navigation.navigate('ImageShareScreen', {
      posterImageUrl: posterImageUrl,
      selectedCategory: selectedCategory,
      selectedCategoryId: selectedCategoryId,
      idToken: user.idToken,
      contactBarImageUrl: `https://practiceguru.pro/images/${user.contactbar}`
    });
  };

  const renderPosterItem = ({ item }) => {
    const currentDate = new Date();
    const isSubscribed = user.subscribedCategories.some(category => {
      const endDate = new Date(category.end_date);
      return category.id === selectedCategoryId && endDate >= currentDate;
    });

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
      <FlatList
        data={posters}
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
