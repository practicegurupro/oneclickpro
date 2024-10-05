import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, Image } from 'react-native';
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
  const [mobile, setMobile] = useState(''); // Add state for mobile number
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const { setUser } = useContext(UserContext);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = () => {
    if (!email || !password || !mobile) {
      Alert.alert('Validation Error', 'Email, password, and mobile cannot be blank.');
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
          saveUserToDatabase(user.email, password, mobile, user.uid, idToken);
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

  const saveUserToDatabase = (email: string, password: string, mobile: string, firebase_uid: string, idToken: string) => {
    const apiURL = 'https://oneclickbranding.ai/register_user.php';

    const postData = new URLSearchParams();
    postData.append('email', email);
    postData.append('password', password); // Send the plain password (PHP will hash it)
    postData.append('mobile', mobile); // Send the mobile number
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
      <View style={styles.formContainer}>
        <Image
          source={{ uri: 'https://oneclickbranding.ai/indexfiles/oneclickLogo.png' }}
          style={styles.logo}
        />
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
          placeholder="Mobile"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} // Toggle visibility based on showPassword state
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Text style={styles.toggleText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
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
    elevation: 5,
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
  registerButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
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

export default Register;
