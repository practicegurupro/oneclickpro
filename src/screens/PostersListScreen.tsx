import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import auth from '@react-native-firebase/auth';
import { useIsFocused } from '@react-navigation/native';
import UserContext from '../context/UserContext';

const Tab = createMaterialTopTabNavigator();

// Custom TabBar Component
const CustomTabBar = (props) => {
  const { state, descriptors, navigation } = props;

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key} // Pass key explicitly here
            onPress={onPress}
            style={[styles.tabItem, isFocused ? styles.tabItemFocused : null]}
          >
            <Text style={{ color: isFocused ? '#673ab7' : '#222' }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// PosterListContent component for both tabs (English and Hindi)
const PosterListContent = ({ language, route, navigation }) => {
  const { selectedCategory, selectedCategoryId, tableName } = route.params;
  const [posters, setPosters] = useState([]);
  const [filteredPosters, setFilteredPosters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [contactBar, setContactBar] = useState('');
  const [watermark, setWatermark] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchPostersAndSubscriptionStatus = async () => {
      try {
        setLoading(true);

        const idToken = await auth().currentUser?.getIdToken(true);
        if (!idToken) {
          throw new Error('Failed to retrieve ID token');
        }

        // Fetch posters filtered by language
        const postersResponse = await fetch('https://oneclickbranding.ai/fetch_posters_list.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache',
          },
          body: new URLSearchParams({
            idToken: idToken,
            tableName: tableName,
            language: language, // Pass the language (English or Hindi)
          }).toString(),
        });

        const postersData = await postersResponse.json();
        if (postersData.success) {
          setPosters(postersData.posters);
          setFilteredPosters(postersData.posters);
        } else {
          console.error('Error fetching posters:', postersData.message);
        }

        // Fetch subscription status
        const subscriptionResponse = await fetch('https://oneclickbranding.ai/subscription_status.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache',
          },
          body: new URLSearchParams({
            idToken: idToken,
            categoryId: selectedCategoryId,
          }).toString(),
        });

        const subscriptionData = await subscriptionResponse.json();
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
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchPostersAndSubscriptionStatus(); // Fetch data when screen is focused
    }
  }, [isFocused, selectedCategoryId, tableName, language]);

  const handlePosterPress = (posterImageName, posterName) => {
    const posterImageUrl = isSubscribed
      ? `https://oneclickbranding.ai/posters/paid/${posterImageName}`
      : `https://oneclickbranding.ai/posters/notpaid/${posterImageName}`;

    const contactBarImageUrl = isSubscribed
      ? `https://practiceguru.pro/images/${contactBar}`
      : `https://practiceguru.pro/images/yourfirmcontactbartaxprofessional.png`;

    navigation.navigate('ImageShareScreen', {
      posterImageUrl: posterImageUrl,
      poster_name: posterName,
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
      setFilteredPosters(posters);
    }
  };

  const renderPosterItem = ({ item }) => {
    const posterImageUrl = isSubscribed
      ? `https://oneclickbranding.ai/posters/paid/${item.poster_image_url}`
      : `https://oneclickbranding.ai/posters/notpaid/${item.poster_image_url}`;

    return (
      <TouchableOpacity
        style={styles.posterContainer}
        onPress={() => handlePosterPress(item.poster_image_url, item.poster_name)}
        key={item.id.toString()} // Ensure key is passed directly here
      >
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
            placeholder={`Search ${language} posters...`}
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

// Main PosterListScreen with Tab Navigator
const PostersListScreen = ({ route, navigation }) => {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{
      lazy: true,  
    }}
    >
      <Tab.Screen
        name="EnglishPosters"
        children={() => <PosterListContent language="English" route={route} navigation={navigation} />}
      />
      <Tab.Screen
        name="HindiPosters"
        children={() => <PosterListContent language="Hindi" route={route} navigation={navigation} />}
      />
    </Tab.Navigator>
  );
};

export default PostersListScreen;

// Styles
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabItemFocused: {
    borderBottomWidth: 2,
    borderBottomColor: '#673ab7',
  },
});
