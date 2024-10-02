import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import auth from '@react-native-firebase/auth';
import UserContext from '../context/UserContext';

const FAQScreen = () => {
  const { user } = useContext(UserContext);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFAQs = async () => {
    setLoading(true);
    setError(null);
  
    try {
      console.log('Attempting to fetch ID token...');
  
      const idToken = await auth().currentUser?.getIdToken(true);
      console.log('Retrieved ID token:', idToken);
  
      if (!idToken) {
        console.error('Failed to retrieve ID token');
        throw new Error('Failed to retrieve ID token');
      }
  
      console.log('Making API request with ID token...');
  
      const response = await fetch('https://oneclickbranding.ai/fetch_faqs.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: idToken, // Use the fetched ID token
        }),
      });
  
      console.log('API response status:', response.status);
      const responseText = await response.text();
      console.log('Raw API response:', responseText);
  
      const data = JSON.parse(responseText.trim());
      console.log('Parsed API response:', data);
  
      if (data.success) {
        console.log('Successfully fetched FAQs:', data.faqs);
        setFaqs(data.faqs);
      } else {
        console.error('Error in API response:', data.message);
        throw new Error(data.message || 'Failed to fetch FAQs.');
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      console.log('Finished fetching FAQs');
    }
  };
  


  useEffect(() => {
    console.log('FAQScreen mounted, fetching FAQs...');
    fetchFAQs();
  }, []);

  const handleWhatsAppPress = () => {
    const platformMessage = 'Hi, I have further queries on your FAQs. Please contact me.';

    const url = `https://wa.me/919136637325?text=${encodeURIComponent(platformMessage)}`;
    Linking.openURL(url).catch((err) => {
      console.error('Error opening WhatsApp:', err);
      Alert.alert('Error', 'Unable to open WhatsApp.');
    });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading FAQs...</Text>
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqContainer}>
              <Text style={styles.question}>{faq.question}</Text>
              <Text style={styles.answer}>{faq.answer}</Text>
            </View>
            
          ))}
            <View style={styles.bottomSpacing}></View>
        </ScrollView>
      )}
      <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppPress}>
        <Text style={styles.whatsappButtonText}>Get More Info</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  faqContainer: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  answer: {
    fontSize: 16,
    color: '#555',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  bottomSpacing: {
    height: 80, 
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FAQScreen;
