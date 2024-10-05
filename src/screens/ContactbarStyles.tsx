import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Contactbarstyles = () => {
  return (
    <View style={styles.container}>
      {/* Sample Contact Information */}
      <View style={styles.contactItem}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.info}>+91 12345 67890</Text>
      </View>

      <View style={styles.contactItem}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.info}>support@example.com</Text>
      </View>

      <View style={styles.contactItem}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.info}>123, Business Street, City, India</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  contactItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  info: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
});

export default Contactbarstyles;
