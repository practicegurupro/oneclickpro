import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

const OTPVerificationScreen = ({ route, navigation }) => {
  const { verificationId, email, password, idToken } = route.params; // Get the necessary data
  const [otp, setOtp] = useState('');

  const handleVerifyOtp = async () => {
    if (otp.length === 6) {
      try {
        const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
        await auth().signInWithCredential(credential);
        Alert.alert('Phone number verified successfully!');

        // After OTP is verified, send the user to login for auto-login
        autoLoginUser(email, idToken, password);
      } catch (error) {
        console.error('Invalid OTP:', error);
        Alert.alert('Invalid OTP', 'Please try again.');
      }
    } else {
      Alert.alert('Validation Error', 'OTP must be 6 digits.');
    }
  };

  // Redirect to the login API after successful OTP verification
  const autoLoginUser = (email, idToken, password) => {
    fetch('https://oneclickbranding.ai/login_api_app.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        idToken: idToken, // Send the Firebase ID token for auto-login
      }).toString(),
    })
    .then(response => response.json())
    .then(jsonData => {
      if (jsonData.success) {
        navigation.navigate('CategoryScreen'); // Navigate to the next screen after login
      } else {
        Alert.alert('Login Error', jsonData.message);
      }
    })
    .catch(error => {
      console.error('Error logging in after OTP verification:', error);
      Alert.alert('Network Error', 'There was an error connecting to the server.');
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
      />
      <Button title="Verify OTP" onPress={handleVerifyOtp} />
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

export default OTPVerificationScreen;
