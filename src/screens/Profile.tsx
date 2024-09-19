import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import UserContext from '../context/UserContext'; // Import UserContext

const Profile = ({ navigation }) => {
  // Access user data from UserContext
  const { user } = useContext(UserContext);

  // Use the user data from context
  const email = user?.email || 'Unknown';
  const createdAt = user?.createdAt || 'Unknown';
  const contactbar = user?.contactbar || 'Unknown';
  const subscribedCategories = user?.subscribedCategories || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>

      {/* Display email, created_at, and contactbar details */}
      <Text style={styles.info}><Text style={styles.boldText}>Email:</Text> {email}</Text>
      <Text style={styles.info}><Text style={styles.boldText}>Account Created At:</Text> {createdAt}</Text>
      <Text style={styles.info}><Text style={styles.boldText}>Contactbar:</Text> {contactbar}</Text>

      {/* Display user subscribed categories */}
      <Text style={styles.title}>Subscribed Categories:</Text>
      {subscribedCategories.length > 0 ? (
        subscribedCategories.map((category, index) => (
          <View key={index} style={styles.categoryContainer}>
            <Text style={styles.info}><Text style={styles.boldText}>Category:</Text> {category.category_name}</Text>
            <Text style={styles.info}><Text style={styles.boldText}>Start Date:</Text> {category.start_date}</Text>
            <Text style={styles.info}><Text style={styles.boldText}>End Date:</Text> {category.end_date}</Text>
          </View>
        ))
      ) : (
        <Text>No categories subscribed yet.</Text>
      )}

      <Button
        title="Open Drawer"
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      />
      <Button
        title="Go to Home"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  categoryContainer: {
    marginBottom: 20,
  },
});

export default Profile;
