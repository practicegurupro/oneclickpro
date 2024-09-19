import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import ImageShareScreen from './src/screens/ImageShareScreen';
import Profile from './src/screens/Profile'; 

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={MainStackNavigator} />
        <Drawer.Screen name="Profile" component={Profile} />
        <Drawer.Screen name="Logout" component={LogoutScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const MainStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ImageShareScreen" component={ImageShareScreen} />
    </Stack.Navigator>
  );
};

const LogoutScreen = ({ navigation }) => {
  React.useEffect(() => {
    // Implement your logout logic here
    // e.g., Firebase sign out
    auth().signOut().then(() => navigation.replace('Login')); // Redirect to login after logout
  }, [navigation]);

  return null; // Render nothing while logging out
};

export default App;
