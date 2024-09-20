import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import UserContext from '../context/UserContext';

const CategoryScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);

  // Extract the subscribed and non-subscribed categories from the user context
  const subscribedCategories = user?.subscribedCategories || [];
  const nonSubscribedCategories = user?.nonSubscribedCategories || [];

  const handleCategoryPress = (category) => {
    if (user?.idToken) {
      navigation.navigate('PostersTypesScreen', { idToken: user.idToken, selectedCategory: category });
    } else {
      console.error('Error: idToken is undefined');
      Alert.alert('Error', 'Unable to authenticate. Please log in again.');
    }
  };
  
  

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
