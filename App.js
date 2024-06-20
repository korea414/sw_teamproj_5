import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import MainScreen from './screens/MainScreen';
import Video from './screens/Video';
import CalendarScreen from './screens/CalendarScreen';
import ChattingScreen from './screens/ChattingScreen';
import LiveHealthNavigator from './screens/LiveHealthNavigator';
import MyPage from './screens/MyPage'; // MyPage 스크린 임포트

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Video" component={Video} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Chatting" component={ChattingScreen} />
        <Stack.Screen name="Navigator" component={LiveHealthNavigator} />
        <Stack.Screen name="MyPage" component={MyPage} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
