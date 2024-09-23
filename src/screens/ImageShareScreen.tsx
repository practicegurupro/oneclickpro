import React, { useContext, useRef, useEffect } from 'react';
import { View, Text, Image, Button, PermissionsAndroid, Platform, Alert, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Share as NativeShare } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import UserContext from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const containerWidth = screenWidth * 0.9;
const containerHeight = (containerWidth / 1080) * 1350;

const ImageShareScreen = ({ route }) => {
  const { posterImageUrl, selectedCategory, contactBarImageUrl, watermarkText } = route.params;
  const viewShotRef = useRef(null);
  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  useEffect(() => {
    console.log('Platform.OS:', Platform.OS); // Debugging log
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      navigation.setOptions({
        headerRight: () => (
          <Button
            onPress={() => navigation.navigate('CategoryScreen')}
            title="Go to Home"
            color="#000"
          />
        ),
      });
    }
  }, [navigation]);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android' && Platform.Version < 30) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to save screenshots',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Error while requesting permissions: ', err);
        return false;
      }
    }
    return true;
  };

  const captureAndShareScreenshotAndroid = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to share images.');
      return;
    }

    try {
      const uri = await viewShotRef.current.capture(); // Capture the screenshot
      const base64data = await RNFS.readFile(uri, 'base64');
      
      let shareImage = {
        url: `data:image/png;base64,${base64data}`,
        type: 'image/png',
      };

      await Share.open(shareImage);
      console.log('Shared successfully');
    } catch (err) {
      console.error('Error while sharing:', err);
    }
  };

  const handleShareImageIOS = async () => {
    try {
      const uri = await viewShotRef.current.capture(); // Capture the screenshot
      const formattedUri = uri.startsWith('file://') ? uri : `file://${uri}`;

      const result = await NativeShare.share({
        url: formattedUri,
      });

      if (result.action === NativeShare.sharedAction) {
        console.log('Image shared successfully');
      } else if (result.action === NativeShare.dismissedAction) {
        console.log('Share dialog dismissed');
      }
    } catch (error) {
      console.error('Error sharing screenshot on iOS:', error.message);
    }
  };

  return (
    <View style={styles.container}>
    
      <Text style={styles.userName}>{user?.email || 'User Name'}</Text>
      <Text style={styles.categoryName}>{selectedCategory}</Text>

      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: posterImageUrl || '' }}
              style={styles.firstImage}
            />
            {/* Ensure that the watermark text is visible */}
            <Text style={styles.watermark}>{watermarkText}</Text>
            <Image
              source={{ uri: contactBarImageUrl || '' }}
              style={styles.secondImage}
            />
          </View>
        </ViewShot>
        
        {Platform.OS === 'android' ? (
          <Button title="Capture and Share on Android" onPress={captureAndShareScreenshotAndroid} />
        ) : (
          <TouchableOpacity style={styles.shareButton} onPress={handleShareImageIOS}>
            <Text style={styles.shareButtonText}>Capture and Share on iOS</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  header: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'flex-end',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 10,
    paddingBottom: 60,
    alignItems: 'center',
  },
  scrollView: {
    marginTop: 10,
    flexGrow: 1,
    paddingBottom: 60,
  },
  imageContainer: {
    width: containerWidth,
    height: containerHeight,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginHorizontal: '5%',
    position: 'relative',
    marginBottom: 20,
  },
  firstImage: {
    width: '100%',
    height: '75%',
    resizeMode: 'cover',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '25%',
    transform: [{ translateX: -50 }, { translateY: -50 }, { rotate: '-45deg' }],
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    width: '100%',
    zIndex: 2, // Ensure watermark is above the image
  },
  secondImage: {
    width: '100%',
    height: '25%',
    resizeMode: 'cover',
  },
  shareButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 70,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
});

export default ImageShareScreen;
