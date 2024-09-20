import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import UserContext from '../context/UserContext';

const PostersListScreen = ({ route, navigation }) => {
  const { tableName, idToken } = route.params; // Get the table name and ID token from the previous screen
  const [posters, setPosters] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    // Fetch the posters from the API
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

  const handlePosterPress = (posterImageUrl) => {
    // Navigate to ImageShareScreen and pass the selected poster image and user's contactbar
    navigation.navigate('ImageShareScreen', {
      posterImageUrl: posterImageUrl,
      contactBarImageUrl: `https://practiceguru.pro/images/${user.contactbar}`,
    });
  };

  const renderPosterItem = ({ item }) => (
    <TouchableOpacity style={styles.posterContainer} onPress={() => handlePosterPress(item.poster_image_url)}>
      <Image source={{ uri: item.poster_image_url }} style={styles.posterImage} />
      <Text style={styles.posterName}>{item.poster_name}</Text>
    </TouchableOpacity>
  );

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
