import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const containerWidth = width * 0.9 * 1.1;
const buttonHeight = (width * 0.4) * 1.1;

const screenNameMap = {
  'Calendar': '운동계획 캘린더',
  'Video': '운동비디오',
  'Chatting': '운동 챗봇',
  'Navigator': '실시간 운동지도',
};

export default function MainScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [recentApp, setRecentApp] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name);
      }
      const recentData = await AsyncStorage.getItem('recentApp');
      if (recentData) {
        setRecentApp(recentData);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.navigate('Login');
  };

  const handleNavigate = async (screen) => {
    await AsyncStorage.setItem('recentApp', screen);
    setRecentApp(screen);
    navigation.navigate(screen);
  };

  const getDisplayName = (screen) => {
    return screenNameMap[screen] || screen;
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.buttonColumn}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.buttonText}>로그아웃</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.myPageButton} onPress={() => navigation.navigate('MyPage')}>
              <Text style={styles.buttonText}>마이페이지</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.card, styles.redCard]} onPress={() => handleNavigate('Calendar')}>
            <Text style={styles.cardText}>운동계획 캘린더</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.card, styles.blueCard]} onPress={() => handleNavigate('Video')}>
            <Text style={styles.cardText}>운동비디오</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.card, styles.orangeCard]} onPress={() => handleNavigate('Chatting')}>
            <Text style={styles.cardText}>운동 챗봇</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.card, styles.greenCard]} onPress={() => handleNavigate('Navigator')}>
            <Text style={styles.cardText}>실시간 운동지도</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recentAppContainer}>
          <Text style={styles.recentAppText}>최근에 열었던 화면</Text>
          {recentApp ? (
            <TouchableOpacity onPress={() => handleNavigate(recentApp)}>
              <Text style={styles.appItem}>{getDisplayName(recentApp)}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.appItem}>최근에 열었던 항목이 없습니다</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    width: containerWidth,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 25,
  },
  userName: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  buttonColumn: {
    flexDirection: 'column',
  },
  logoutButton: {
    backgroundColor: '#ff4757',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  myPageButton: {
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  card: {
    width: containerWidth * 0.45,
    height: buttonHeight,
    borderRadius: 15,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redCard: {
    backgroundColor: '#ff6b6b',
  },
  blueCard: {
    backgroundColor: '#1e90ff',
  },
  orangeCard: {
    backgroundColor: '#ffa502',
  },
  greenCard: {
    backgroundColor: '#2ed573',
  },
  cardText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentAppContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  recentAppText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  appItem: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
});
