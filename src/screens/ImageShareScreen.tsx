import React, { useContext, useEffect, useRef, useState } from 'react';
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
  const navigation = useNavigation();
  const viewShotRef = useRef(null);
  const { selectedCategory, selectedCategoryId, posterImageUrl } = route.params;
  const { user } = useContext(UserContext);
  const [contactBarImageUrl, setContactBarImageUrl] = useState('');
  const [watermarkText, setWatermarkText] = useState('');

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate('CategoryScreen')}
          title="Go to Home"
          color="#000"
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const currentDate = new Date();
    const subscription = user.subscribedCategories.find(category => category.id === selectedCategoryId);
    const isSubscribed = subscription && new Date(subscription.end_date) >= currentDate;

    console.log('Is Subscribed (Paid) Category:', isSubscribed);

    if (isSubscribed) {
      fetch('https://oneclickbranding.ai/fetch_contactbar.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          idToken: user.idToken,
          categoryId: selectedCategoryId,
        }).toString(),
      })
      .then(response => response.text())
      .then(data => {
        console.log('Raw response:', data);
        try {
          const jsonData = JSON.parse(data.trim());
          if (jsonData.success && jsonData.contactbar) {
            setContactBarImageUrl(`https://practiceguru.pro/images/${jsonData.contactbar}`);
            setWatermarkText(jsonData.watermark || 'OneClick Branding');
          } else {
            throw new Error('Invalid API response or contact bar not found.');
          }
        } catch (e) {
          console.error('JSON Parse Error or API Issue:', e);
          console.log('Failed data:', data);
          setContactBarImageUrl('https://practiceguru.pro/images/yourfirmcontactbartaxprofessional.png');
          setWatermarkText('OneClick Branding');
        }
      })
      .catch(error => {
        console.error('Network or Server Error:', error);
        setContactBarImageUrl('https://practiceguru.pro/images/yourfirmcontactbartaxprofessional.png');
        setWatermarkText('OneClick Branding');
      });
    } else {
      setContactBarImageUrl('https://practiceguru.pro/images/yourfirmcontactbartaxprofessional.png');
      setWatermarkText('OneClick Branding');
    }
  }, [selectedCategoryId, user.idToken]);

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

    viewShotRef.current.capture().then(uri => {
      RNFS.readFile(uri, 'base64').then((base64data) => {
        let shareImage = {
          url: `data:image/png;base64,${base64data}`,
          type: 'image/png',
        };

        Share.open(shareImage)
          .then(res => console.log('Shared successfully: ', res))
          .catch(err => console.log('Error while sharing: ', err));
      });
    }).catch(err => {
      console.log('Error capturing screenshot: ', err);
    });
  };

  const handleShareImageIOS = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        const formattedUri = uri.startsWith('file://') ? uri : `file://${uri}`;

        const result = await NativeShare.share({
          url: formattedUri,
        });

        if (result.action === NativeShare.sharedAction) {
          if (result.activityType) {
            console.log('Image shared successfully');
          } else {
            console.log('Sharing completed');
          }
        } else if (result.action === NativeShare.dismissedAction) {
          console.log('Share dialog dismissed');
        }
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
  },
});

export default ImageShareScreen;
