import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';

const EditProfile = ({ navigation, route }) => {
  const { profileData, onProfileUpdate } = route.params;  // Passed from Profile screen, with callback
  const [name, setName] = useState(profileData.name);
  const [mobile, setMobile] = useState(profileData.mobile);
  const [photo, setPhoto] = useState(profileData.photo);
  const [photoFile, setPhotoFile] = useState(null);  // To hold the selected photo file

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('mobile', mobile);

    if (photoFile) {
      formData.append('photo', {
        uri: photoFile.uri,
        name: photoFile.fileName,
        type: photoFile.type,
      });
    }

    try {
      // Get the current user's Firebase ID token
      const idToken = await auth().currentUser?.getIdToken(true);
      formData.append('idToken', idToken);

      const response = await fetch('https://oneclickbranding.ai/edit_profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const json = await response.json();
      if (json.success) {
        Alert.alert('Success', json.message, [
          { text: 'OK', onPress: () => {
              if (onProfileUpdate) {
                // Call the parent callback to update profile data
                onProfileUpdate({
                  name,
                  mobile,
                  photo: photoFile ? photoFile.uri : photo,
                });
              }
              navigation.goBack();  // Navigate back after saving
            } 
          },
        ]);
      } else {
        throw new Error(json.message || 'Failed to update profile.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Handle choosing a photo from the gallery
  const handleChoosePhoto = () => {
    const options = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets.length > 0) {
        const selectedPhoto = response.assets[0];
        setPhotoFile(selectedPhoto);  // Set the selected photo
        setPhoto(selectedPhoto.uri);  // Update the preview
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
  
      <Text style={styles.label}>Mobile</Text>
      <TextInput
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
        style={styles.input}
      />
  
      <Text style={styles.label}>Profile Photo</Text>
      <TouchableOpacity onPress={handleChoosePhoto}>
        <Image source={{ uri: photo }} style={styles.profilePhoto} />
      </TouchableOpacity>
  
      {/* Add the message before the Save button */}
      <Text style={styles.warningMessage}>
        Please log in again after editing your details.
      </Text>
  
      <Button title="Save" onPress={handleSave} />
    </View>
  );
  };
  
  const styles = StyleSheet.create({
    container: {
      padding: 20,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 10,
      borderRadius: 8,
      marginBottom: 20,
    },
    profilePhoto: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 20,
    },
    warningMessage: {
      fontSize: 14,
      color: 'red',
      marginBottom: 20,
      textAlign: 'center',  // Center-align the text
    },
  });
  
  export default EditProfile;
  