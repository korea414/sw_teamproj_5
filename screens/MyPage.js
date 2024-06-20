import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export default function MyPage({ navigation }) {
  const [userName, setUserName] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [recentApps, setRecentApps] = useState([]);
  const [selectedTab, setSelectedTab] = useState('캘린더');
  const [calendarWorkouts, setCalendarWorkouts] = useState({});
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name);
          setUserDetails(user);
        }
        const recentData = await AsyncStorage.getItem('recentApps');
        if (recentData) {
          setRecentApps(JSON.parse(recentData));
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const savedChatHistory = await AsyncStorage.getItem('chatHistory');
        if (savedChatHistory) {
          setChatHistory(JSON.parse(savedChatHistory));
        }
      } catch (error) {
        console.error("Error fetching chat history: ", error);
      }
    };

    fetchChatHistory();
  }, [selectedTab]);

  const fetchCalendarData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@workouts');
      if (jsonValue != null) {
        setCalendarWorkouts(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Error loading calendar data', e);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        Alert.alert("Error", "No user data found.");
        return;
      }
      const user = JSON.parse(userData);
      const fileUri = FileSystem.documentDirectory + 'users.csv';

      const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      const users = fileContent.split('\n').filter(Boolean);

      const updatedUsers = users.filter(u => {
        const [username] = u.split(',');
        return username !== user.username;
      }).join('\n') + '\n';

      await FileSystem.writeAsStringAsync(fileUri, updatedUsers, { encoding: FileSystem.EncodingType.UTF8 });
      await AsyncStorage.clear();

      Alert.alert("Account Deleted", "Your account has been deleted successfully.");
      navigation.navigate('Login'); // Redirect to Login screen after account deletion
    } catch (error) {
      console.error("Error deleting account: ", error);
      Alert.alert("Error", "Could not delete account.");
    }
  };

  const handleGoBack = () => {
    navigation.navigate('Main'); // Navigate back to Main screen
  };

  const renderContent = () => {
    switch (selectedTab) {
      case '캘린더':
        return (
          <ScrollView style={styles.scrollView}>
            {Object.keys(calendarWorkouts).map(date => (
              <View key={date} style={styles.workoutContainer}>
                <Text style={styles.dateText}>{date}</Text>
                {calendarWorkouts[date].map((workout, index) => (
                  <Text key={index} style={styles.workoutText}>
                    {`${workout.type}: ${workout.name}, `}
                    {workout.timeBased ? `Duration: ${workout.duration}s` : `Sets: ${workout.sets}, Reps: ${workout.reps}`}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>
        );
      case 'AI 챗봇':
        return (
          <ScrollView style={styles.scrollView}>
            {chatHistory.map((item, index) => (
              <View key={index} style={styles.chatItem}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{item.input}</Text>
                </View>
                <View style={styles.botBubble}>
                  <Text style={styles.botText}>{item.response}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        );
      case '회원 정보':
        return (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>이름: {userDetails.name}</Text>
            <Text style={styles.detailsText}>성별: {userDetails.gender}</Text>
            <Text style={styles.detailsText}>주소: {userDetails.address}</Text>
            <Text style={styles.detailsText}>나이: {userDetails.age}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.profileImage} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.userName}>{userName}</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Text style={styles.deleteButtonText}>회원탈퇴</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabButton} onPress={() => { setSelectedTab('캘린더'); fetchCalendarData(); }}>
          <Text style={styles.tabItem}>캘린더</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setSelectedTab('AI 챗봇')}>
          <Text style={styles.tabItem}>AI 챗봇</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setSelectedTab('회원 정보')}>
          <Text style={styles.tabItem}>회원 정보</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        {renderContent()}
        <FlatList
          data={recentApps}
          renderItem={({ item }) => <Text style={styles.appItem}>{item}</Text>}
          keyExtractor={(item, index) => index.toString()}
        />
        
      </View>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Text style={styles.backButtonText}>메인으로 돌아가기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'green',
    padding: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 30,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  profileTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 30,
    color: 'white',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'green',
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabItem: {
    color: 'white',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    marginBottom: 20,
  },
  workoutContainer: {
    marginBottom: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  workoutText: {
    fontSize: 16,
    marginBottom: 3,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailsText: {
    fontSize: 40,
    marginBottom: 5,
  },
  appItem: {
    fontSize: 16,
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 5,
    borderRadius: 5,
  },
  infoText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  backButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chatItem: {
    marginBottom: 20,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderRadius: 15,
    padding: 10,
    marginBottom: 5,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDEDED',
    borderRadius: 15,
    padding: 10,
  },
  userText: {
    fontSize: 16,
  },
  botText: {
    fontSize: 16,
  },
});
