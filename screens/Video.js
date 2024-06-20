import * as Linking from 'expo-linking';
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ImageBackground, Text, View, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from 'react-native-vector-icons';

import img from "../assets/pushup.png";
import img2 from "../assets/bicyclecrunch.png";
import img3 from "../assets/burpee.png";
import img4 from "../assets/airsquat.png";
import img5 from "../assets/pikewalk.png";
import img6 from "../assets/situp.png";

const videos = [
  { id: 1, name: "PUSH UP 언리얼5 운동 시뮬레이션 영상", url: "https://youtu.be/nrqjOvw3-uQ", image: img },
  { id: 2, name: "BICYCLE CRUNCH 언리얼5 운동 시뮬레이션 영상", url: "https://youtu.be/_spqUOT2_Vc", image: img2 },
  { id: 3, name: "BURPEE 언리얼5 운동 시뮬레이션 영상", url: "https://youtu.be/Mwnjq1efA5s", image: img3 },
  { id: 4, name: "AIR SQUAT 언리얼5 운동 시뮬레이션 영상", url: "https://youtu.be/QCi9tWQ4le4", image: img4 },
  { id: 5, name: "PIKE WALK 언리얼5 운동 시뮬레이션 영상", url: "https://youtu.be/3REF5zsHQcU", image: img5 },
  { id: 6, name: "SIT UP 언리얼5 운동 시뮬레이션 영상", url: "https://youtu.be/sCVkLTBMYJE", image: img6 },
];

const Video = ({ navigation }) => {
  const [savedVideos, setSavedVideos] = useState([]);

  useEffect(() => {
    const loadSavedVideos = async () => {
      const jsonValue = await AsyncStorage.getItem('@saved_videos');
      if (jsonValue != null) {
        setSavedVideos(JSON.parse(jsonValue));
      }
    };
    loadSavedVideos();
  }, []);

  const handleSaveVideo = async (video) => {
    const newSavedVideos = [...savedVideos, video];
    setSavedVideos(newSavedVideos);
    await AsyncStorage.setItem('@saved_videos', JSON.stringify(newSavedVideos));
    Alert.alert('저장 완료', '영상이 저장되었습니다.');
  };

  const handleGoHome = () => {
    navigation.navigate('Main'); // 홈으로 돌아가기
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <FontAwesome name="home" size={24} color="white" />
      </TouchableOpacity>
      <ScrollView>
        {videos.map(video => (
          <View key={video.id} style={styles.videoContainer}>
            <TouchableOpacity onPress={() => Linking.openURL(video.url)}>
              <ImageBackground source={video.image} style={styles.imageStyle}>
                <View style={styles.textContainer}>
                  <Text style={styles.videoText}>{video.name}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveVideo(video)}>
                <Text style={styles.buttonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
  },
  homeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#4285F4',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // ensure the button is on top of other elements
  },
  videoContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageStyle: {
    height: 180,
    justifyContent: 'flex-end',
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  videoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Video;
