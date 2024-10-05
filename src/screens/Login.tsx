import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import UserContext from '../context/UserContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { IconButton } from 'react-native-paper';

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
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useContext(UserContext);

   // Function to toggle password visibility
   const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Email and password cannot be blank.');
      return;
    }

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
            idToken: idToken,
          }).toString(),
        })
        .then(response => response.text())
        .then(data => {
          try {
            const jsonData = JSON.parse(data.trim());
            if (jsonData.success) {
              setUser({
                email: jsonData.email,
                createdAt: jsonData.created_at,
                contactbar: jsonData.contactbar,
                subscribedCategories: jsonData.subscribed_categories,
                nonSubscribedCategories: jsonData.non_subscribed_categories,
                idToken: idToken,
              });
              navigation.navigate('CategoryScreen');
            } else {
              Alert.alert('Login Error', jsonData.message);
            }
          } catch (e) {
            console.error('Failed to parse JSON:', e);
            console.log('Data received:', data);
            Alert.alert('Error', 'Failed to parse server response.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          Alert.alert('Network Error', 'There was an error connecting to the server.');
        });
      })
      .catch(error => {
        let errorMessage = 'Login failed. Please try again.';

        if (error.code === 'auth/user-not-found') {
          errorMessage = 'No user found with this email.';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'The email address is invalid.';
        }

        Alert.alert('Login Error', errorMessage);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Image
          source={{ uri: 'https://oneclickbranding.ai/indexfiles/oneclickLogo.png' }}
          style={styles.logo}
        />
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Text style={styles.toggleText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f7',
  },
  formContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // For Android shadow
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 12,
   
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10, 
    backgroundColor: '#f9f9f9',
    paddingLeft: 12,
    marginBottom: 20,
  },
  toggleText: {
    marginRight: 10,
    color: '#007BFF',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    color: '#007BFF',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default Login;