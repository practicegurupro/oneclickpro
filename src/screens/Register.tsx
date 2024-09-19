import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';  // Define your type for navigation params

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Register'
>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

const Register = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
        console.log('User registered in Firebase:', user);

        // Fetch the Firebase ID token after registration
        user.getIdToken().then(idToken => {
          // After getting the ID token, send data to PHP API to store in MySQL
          saveUserToDatabase(user.email, password, user.uid, idToken);
        });
      })
      .catch(error => {
        console.error('Error creating user in Firebase:', error);
        Alert.alert('Register Error', error.message);
      });
  };

  // Function to send the registered user data to the PHP API
  const saveUserToDatabase = (email: string, password: string, firebase_uid: string, idToken: string) => {
    const apiURL = 'https://oneclickbranding.ai/register_user.php'; // Your PHP API endpoint

    const postData = new URLSearchParams();
    postData.append('email', email);
    postData.append('password', password); // Send the plain password (PHP will hash it)
    postData.append('firebase_uid', firebase_uid); // Ensure this is correct
    postData.append('idToken', idToken);  // Send the Firebase ID token for verification

    fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postData.toString(),
    })
      .then(response => response.text())
      .then(data => {
        console.log('Server response:', data);
        Alert.alert('Success', 'User registered successfully!');
        navigation.navigate('Login');  // Navigate to Login screen
      })
      .catch(error => {
        console.error('Error saving user to the database:', error);
        Alert.alert('Database Error', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
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
      <Button title="Register" onPress={handleRegister} />
      <Button
        title="Already have an account? Login"
        onPress={() => navigation.navigate('Login')}
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

export default Register;
