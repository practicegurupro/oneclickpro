import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import UserContext from '../context/UserContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="gray" />
        </TouchableOpacity>
      </View>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 8,
    marginBottom: 12,
  },
});

export default Login;
