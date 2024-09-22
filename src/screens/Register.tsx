import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import UserContext from '../context/UserContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

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
  const { setUser } = useContext(UserContext);

  const handleRegister = () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Email and password cannot be blank.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password should be at least 6 characters long.');
      return;
    }

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
        let errorMessage = 'Registration failed. Please try again.';

        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'That email address is already in use!';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'That email address is invalid!';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'The password is too weak. Please choose a stronger password.';
        }

        Alert.alert('Register Error', errorMessage);
      });
  };

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const saveUserToDatabase = (email: string, password: string, firebase_uid: string, idToken: string) => {
    const apiURL = 'https://oneclickbranding.ai/register_user.php';

    const postData = new URLSearchParams();
    postData.append('email', email);
    postData.append('password', password); // Send the plain password (PHP will hash it)
    postData.append('firebase_uid', firebase_uid); 
    postData.append('idToken', idToken);

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

        // After successful registration, fetch user details as in the login process
        fetch('https://oneclickbranding.ai/login_api_app.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            idToken: idToken,
          }).toString(),
        })
        .then(response => response.json())
        .then(jsonData => {
          if (jsonData.success) {
            setUser({
              email: jsonData.email,
              createdAt: jsonData.created_at,
              contactbar: jsonData.contactbar,
              subscribedCategories: jsonData.subscribed_categories,
              nonSubscribedCategories: jsonData.non_subscribed_categories,
              idToken: idToken,
            });

            // Navigate to CategoryScreen directly after registration
            navigation.navigate('CategoryScreen');
          } else {
            Alert.alert('Registration Error', jsonData.message);
          }
        })
        .catch(error => {
          console.error('Error fetching user data after registration:', error);
          Alert.alert('Network Error', 'There was an error connecting to the server.');
        });
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
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
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
  linkText: {
    color: 'blue', // Choose a color that looks like a link
    textDecorationLine: 'underline',
    marginTop: 20, // Adjust spacing as needed
    fontSize: 16,
    textAlign: 'center', // Center the text within its container
  },
});

export default Register;
