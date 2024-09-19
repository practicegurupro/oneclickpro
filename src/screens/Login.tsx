import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import UserContext from '../context/UserContext'; // Import UserContext
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';  // Define your type for navigation params

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const Login = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(UserContext); // Use setUser from context

  const handleLogin = () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const idToken = await userCredential.user.getIdToken();
  
        fetch('https://oneclickbranding.ai/login_api_app.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            idToken: idToken, // Send the Firebase ID token
          }).toString(),
        })
        .then(response => response.text())  // Use text() instead of json() to log the raw response
        .then(data => {
          console.log('Raw response:', data);  // Log the raw response
          
          // Now try to parse it into JSON
          try {
            const jsonData = JSON.parse(data.trim());   // Parse the trimmed data
            if (jsonData.success) {
              // Update the UserContext with the categories and other user details
              setUser({
                email: jsonData.email,
                createdAt: jsonData.created_at,
                contactbar: jsonData.contactbar,
                subscribedCategories: jsonData.subscribed_categories,
                nonSubscribedCategories: jsonData.non_subscribed_categories,
              });
  
              // Navigate to CategoryScreen
              navigation.navigate('CategoryScreen');
            } else {
              Alert.alert('Login Error', jsonData.message);
            }
          } catch (e) {
            console.error('Failed to parse JSON:', e);
            console.log('Data received:', data); // Log data for further inspection
            Alert.alert('Error', 'Failed to parse server response.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          Alert.alert('Network Error', 'There was an error connecting to the server.');
        });
      })
      .catch(error => {
        Alert.alert('Login Error', error.message);
      });
  };
  
  


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Don't have an account? Register"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});

export default Login;
