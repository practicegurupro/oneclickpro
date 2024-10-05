import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';

const AboutUs = () => {
  const [aboutUsContent, setAboutUsContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch the About Us content from the API
  const fetchAboutUsContent = async () => {
    setLoading(true);
    setError(null);

    try {
      // Add a random query parameter to force cache bypass
      const response = await fetch(`https://oneclickbranding.ai/get_about_us.php?_=${new Date().getTime()}`, {
        headers: {
          'Cache-Control': 'no-cache', // Disable caching at the request level
        },
      });

      const json = await response.json();

      if (json.success) {
        setAboutUsContent(json.data);
      } else {
        setError(json.message || 'Failed to load content');
      }
    } catch (err) {
      setError('An error occurred while fetching the content');
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect to force a fetch whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchAboutUsContent(); // Fetch the content whenever the screen is focused
    }, [])
  );

  // Function to open WhatsApp with a default message
  const openWhatsApp = () => {
    const platformMessage = Platform.OS === 'ios' 
    ? 'Hi, I am using your OneClickPro iOS app. I have a question, please contact me. Thanks.' 
    : 'Hi, I am using your OneClickPro Android app. I have a question, please contact me. Thanks.';

    const url = `https://wa.me/919136637325?text=${encodeURIComponent(platformMessage)}`;
    Linking.openURL(url).catch(err => console.error('Error opening WhatsApp:', err));
  };

  // Function to open social media links
  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Follow Us Section */}
        <View style={styles.followUsContainer}>
      <Text style={styles.followText}>Follow Us</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => openLink('https://www.facebook.com/people/OneClick-Branding/61565222670247/')}>
          <Icon name="facebook" size={30} color="#3b5998" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('https://x.com/1clickbranding')}>
          <Icon name="twitter" size={30} color="#1DA1F2" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('https://www.instagram.com/oneclickbranding')}>
          <Icon name="instagram" size={30} color="#C13584" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('https://www.linkedin.com/yourpage')}>
          <Icon name="linkedin" size={30} color="#0077B5" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          aboutUsContent.map((item, index) => (
            <Text key={index} style={styles.paragraph}>
              {item.content}
            </Text>
          ))
        )}
      </ScrollView>

      {/* Fixed WhatsApp Button */}
      <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
        <Icon name="whatsapp" size={30} color="#fff" />
        <Text style={styles.whatsappButtonText}>Contact Us on WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // Add padding at the bottom to avoid overlap with the WhatsApp button
  },
  followUsContainer: {
    backgroundColor: '#fff', // White background
    padding: 20,
    borderRadius: 10,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom: 20,  // Add margin for spacing
    alignItems: 'center', // Center align content
  },
  followText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    marginHorizontal: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
    lineHeight: 22,
    textAlign: 'justify',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  whatsappButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#25D366',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default AboutUs;
