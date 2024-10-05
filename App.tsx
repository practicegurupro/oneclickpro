import 'react-native-gesture-handler'; // Ensure this is at the top
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native'; // Import these from react-native
import auth from '@react-native-firebase/auth';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import CategoryScreen from './src/screens/CategoryScreen'; 
import PostersTypesScreen from './src/screens/PostersTypesScreen'; 
import PostersListScreen from './src/screens/PostersListScreen.tsx'; 
import ImageShareScreen from './src/screens/ImageShareScreen.tsx'; 
import FAQScreen from './src/screens/FAQScreen'; 
import AboutUs from './src/screens/AboutUs.tsx';
import Profile from './src/screens/Profile';
import EditProfile from './src/screens/EditProfile';
import CustomDrawerContent from './src/screens/CustomDrawerContent.tsx';
import ContactbarStyles from './src/screens/ContactbarStyles.tsx';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen'; 
import { UserProvider } from './src/context/UserContext'; // Import UserProvider

const RootStack = createStackNavigator();
const Drawer = createDrawerNavigator();

const AuthStackNavigator = () => (
  <RootStack.Navigator initialRouteName="Login">
    <RootStack.Screen name="Login" component={Login} />
    <RootStack.Screen name="Register" component={Register} />
    <RootStack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} /> 

  </RootStack.Navigator>
);

const MainStackNavigator = () => (
  <RootStack.Navigator initialRouteName="CategoryScreen">
    <RootStack.Screen 
      name="CategoryScreen" 
      component={CategoryScreen} 
     
    />
    <RootStack.Screen 
      name="PostersTypesScreen" 
      component={PostersTypesScreen} 
    
    />
    <RootStack.Screen 
      name="PostersListScreen" 
      component={PostersListScreen} 
    
    />
    <RootStack.Screen 
      name="ImageShareScreen" 
      component={ImageShareScreen} 
      
    />

<RootStack.Screen 
      name="EditProfile" 
      component={EditProfile} // Keep EditProfile in the stack
    />

      <RootStack.Screen 
      name="FAQScreen" 
      component={FAQScreen} // Add FAQ screen to the stack
    />
  </RootStack.Navigator>
);



const LogoutScreen = ({ navigation }) => {
  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }], // Navigate to the root of Auth stack
          });
          
        }, 100); // 100ms delay
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  return (
    <View style={styles.container}>
    <Text style={styles.text}>Are you sure you want to log out?</Text>
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutButtonText}>Logout</Text>
    </TouchableOpacity>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f7',
    padding: 20,
  },
  text: {
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 3, // For a subtle shadow on Android
  },
  
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

const MainDrawerNavigator = () => (

  <Drawer.Navigator
    initialRouteName="Home"
    drawerContent={(props) => <CustomDrawerContent {...props} />} // Set the custom drawer
  >
    <Drawer.Screen name="Home" component={MainStackNavigator} />
    <Drawer.Screen name="About Us" component={AboutUs} />
    <Drawer.Screen name="Profile" component={Profile} />
   
    <Drawer.Screen name="FAQ" component={FAQScreen} /> 
    <Drawer.Screen name="Contactbar Styles" component={ContactbarStyles} />
    <Drawer.Screen name="Logout" component={LogoutScreen} />
  </Drawer.Navigator>
);

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null; // Render a loading screen if needed

  return (
    <UserProvider>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <RootStack.Screen
              name="MainApp"
              component={MainDrawerNavigator}
            />
          ) : (
            <RootStack.Screen name="Auth" component={AuthStackNavigator} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
