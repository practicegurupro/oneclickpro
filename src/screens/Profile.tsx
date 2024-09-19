import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { DrawerActions } from '@react-navigation/native';

const Profile = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>Profile Page</Text>
      <Button
        title="Open Menu"
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Profile;
