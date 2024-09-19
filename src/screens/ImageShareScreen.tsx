import React, { useRef } from 'react';
import { View, Text, Image, Button, PermissionsAndroid, Platform, Alert, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Share as NativeShare } from 'react-native';
import ViewShot from 'react-native-view-shot'; // To capture the screen
import Share from 'react-native-share'; // For sharing (Android only)
import RNFS from 'react-native-fs'; // For file system (Android only)

// Get the screen width to dynamically adjust the image size
const screenWidth = Dimensions.get('window').width;
const containerWidth = screenWidth * 0.9; // Set the width to 90% of the screen width to leave margins
const containerHeight = (containerWidth / 1080) * 1350; // Calculate height based on the Instagram portrait aspect ratio

const ImageShareScreen = () => {
  const viewShotRef = useRef(null);

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
    return true; // For Android 11 and above, no permission is needed
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
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://practiceguru.pro/ProjectFoodInfo/onclickimages/notpaid/cmp08_octdec23_18jan24_ver2.png' }}
              style={styles.firstImage}
            />
            <Image
              source={{ uri: 'https://practiceguru.pro/images/yourfirmcontactbartaxprofessional.png' }}
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
  },
  firstImage: {
    width: '100%',
    height: '75%',
    resizeMode: 'cover',
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
