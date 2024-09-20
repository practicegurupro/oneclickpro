import 'react-native-gesture-handler'; // Ensure this is at the top
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button } from 'react-native'; // Import these from react-native
import auth from '@react-native-firebase/auth';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import CategoryScreen from './src/screens/CategoryScreen'; 
import PostersTypesScreen from './src/screens/PostersTypesScreen'; 
import PostersListScreen from './src/screens/PostersListScreen.tsx'; 
import ImageShareScreen from './src/screens/ImageShareScreen.tsx'; 
import Profile from './src/screens/Profile';
import { UserProvider } from './src/context/UserContext'; // Import UserProvider

const RootStack = createStackNavigator();
const Drawer = createDrawerNavigator();

const AuthStackNavigator = () => (
  <RootStack.Navigator initialRouteName="Login">
    <RootStack.Screen name="Login" component={Login} />
    <RootStack.Screen name="Register" component={Register} />
  </RootStack.Navigator>
);

const MainStackNavigator = () => (
  <RootStack.Navigator initialRouteName="CategoryScreen">
    <RootStack.Screen name="CategoryScreen" component={CategoryScreen} />
    <RootStack.Screen name="PostersTypesScreen" component={PostersTypesScreen} />
    <RootStack.Screen name="PostersListScreen" component={PostersListScreen} />
    <RootStack.Screen name="ImageShareScreen" component={ImageShareScreen} />
    {/* Add more screens here as needed */}
  </RootStack.Navigator>
);


const LogoutScreen = ({ navigation }) => {
  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        setTimeout(() => {
          navigation.navigate('Login'); // Navigate to Login
        }, 100); // 100ms delay
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Are you sure you want to log out?</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const MainDrawerNavigator = () => (
  <Drawer.Navigator initialRouteName="Home">
    <Drawer.Screen name="Home" component={MainStackNavigator} />
    <Drawer.Screen name="Profile" component={Profile} />
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
