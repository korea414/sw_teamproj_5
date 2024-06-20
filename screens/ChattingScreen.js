import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const workoutData = {
  '전신': [
  { 'name': '버피', 'details': '버피는 전신 운동으로, 팔굽혀펴기와 점프를 결합한 운동입니다.', 'cautions': '무릎 부상에 주의하세요.', 'reps': '하루에 10회씩 3세트', 'calories': '약 10칼로리 소모' },
  { 'name': '마운틴클라이머', 'details': '마운틴 클라이머는 코어와 다리 근육을 강화시키는 운동입니다.', 'cautions': '허리에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 15회씩 3세트', 'calories': '약 8칼로리 소모' },
  { 'name': '점프스쿼트', 'details': '점프 스쿼트는 하체 근력을 강화시키고 심박수를 높이는 운동입니다.', 'cautions': '무릎에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 10회씩 3세트', 'calories': '약 12칼로리 소모' },
  { 'name': '플랭크', 'details': '플랭크는 코어 근육을 강화시키는 운동입니다.', 'cautions': '허리에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 1분씩 3세트', 'calories': '약 4칼로리 소모' },
  { 'name': '하이니즈', 'details': '하이 니즈는 심박수를 높이고 하체를 강화하는 운동입니다.', 'cautions': '허리에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 1분씩 3세트', 'calories': '약 10칼로리 소모' },
  { 'name': '스타점프', 'details': '스타 점프는 전신 근육을 사용하여 점프하는 운동입니다.', 'cautions': '무릎에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 15회씩 3세트', 'calories': '약 8칼로리 소모' },
  { 'name': '크로스잭', 'details': '크로스 잭은 전신 근육을 사용하여 뛰는 운동입니다.', 'cautions': '무릎에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 15회씩 3세트', 'calories': '약 8칼로리 소모' },
  { 'name': '인치웜', 'details': '인치웜은 전신 근육을 사용하여 스트레칭하고 강화하는 운동입니다.', 'cautions': '허리에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 10회씩 3세트', 'calories': '약 6칼로리 소모' },
  { 'name': '스케이터스텝', 'details': '스케이터 스텝은 하체 근력을 강화시키는 운동입니다.', 'cautions': '무릎에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 15회씩 3세트', 'calories': '약 7칼로리 소모' },
  { 'name': '스파이더맨플랭크', 'details': '스파이더맨 플랭크는 코어와 상체 근육을 강화시키는 운동입니다.', 'cautions': '허리에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 10회씩 3세트', 'calories': '약 5칼로리 소모' },
  ],
  '상체': [
  { 'name': '푸시업', 'details': '푸시업은 팔과 가슴 근육을 강화시키는 운동입니다.', 'cautions': '허리에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 20회씩 3세트', 'calories': '약 5칼로리 소모' },
  { 'name': '트라이셉스딥스', 'details': '트라이셉스 딥스는 팔 뒤쪽 근육을 강화시키는 운동입니다.', 'cautions': '어깨에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 15회씩 3세트', 'calories': '약 5칼로리 소모' },
  { 'name': '플랭크숄더탭', 'details': '플랭크 숄더 탭은 코어와 상체 근육을 강화시키는 운동입니다.', 'cautions': '허리에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 1분씩 3세트', 'calories': '약 4칼로리 소모' },
  { 'name': '다이아몬드푸시업', 'details': '다이아몬드 푸시업은 팔과 가슴 근육을 강화시키는 운동입니다.', 'cautions': '어깨에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 10회씩 3세트', 'calories': '약 6칼로리 소모' },
  { 'name': '슈퍼맨', 'details': '슈퍼맨 운동은 허리와 코어 근육을 강화시키는 운동입니다.', 'cautions': '허리에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 1분씩 3세트', 'calories': '약 5칼로리 소모' },
  { 'name': '베어크롤', 'details': '베어 크롤은 전신 근육을 사용하여 기어가는 운동입니다.', 'cautions': '무릎에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 1분씩 3세트', 'calories': '약 7칼로리 소모' },
  { 'name': '팔벌려뛰기', 'details': '팔벌려 뛰기는 심박수를 높이고 전신을 강화하는 운동입니다.', 'cautions': '무릎에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 1분씩 3세트', 'calories': '약 8칼로리 소모' },
  { 'name': '플랭크업다운', 'details': '플랭크 업다운은 코어와 상체 근육을 강화시키는 운동입니다.', 'cautions': '허리에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 10회씩 3세트', 'calories': '약 6칼로리 소모' },
  { 'name': '파이크푸시업', 'details': '파이크 푸시업은 어깨와 상체 근육을 강화시키는 운동입니다.', 'cautions': '어깨에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 10회씩 3세트', 'calories': '약 5칼로리 소모' },
  ],
  '하체': [
  { 'name': '스쿼트', 'details': '스쿼트는 다리와 엉덩이 근육을 강화시키는 운동입니다.', 'cautions': '무릎과 허리에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 20회씩 3세트', 'calories': '약 10칼로리 소모' },
  { 'name': '런지', 'details': '런지는 다리 근육을 강화시키는 운동입니다.', 'cautions': '무릎에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 15회씩 3세트', 'calories': '약 8칼로리 소모' },
  { 'name': '글루트브릿지', 'details': '글루트 브릿지는 엉덩이와 허리 근육을 강화시키는 운동입니다.', 'cautions': '허리에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 15회씩 3세트', 'calories': '약 5칼로리 소모' },
  { 'name': '카프레이즈', 'details': '카프 레이즈는 종아리 근육을 강화시키는 운동입니다.', 'cautions': '무릎에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 20회씩 3세트', 'calories': '약 4칼로리 소모' },
  { 'name': '월시트', 'details': '월 시트는 다리와 엉덩이 근육을 강화시키는 운동입니다.', 'cautions': '무릎에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 1분씩 3세트', 'calories': '약 6칼로리 소모' },
  { 'name': '사이드런지', 'details': '사이드 런지는 다리 근육을 강화시키는 운동입니다.', 'cautions': '무릎에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 15회씩 3세트', 'calories': '약 7칼로리 소모' },
  { 'name': '돈키킥', 'details': '돈키 킥은 엉덩이와 허리 근육을 강화시키는 운동입니다.', 'cautions': '허리에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 15회씩 3세트', 'calories': '약 5칼로리 소모' },
  { 'name': '서클레그리프트', 'details': '서클 레그 리프트는 다리 근육을 강화시키는 운동입니다.', 'cautions': '무릎에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 15회씩 3세트', 'calories': '약 5칼로리 소모' },
  { 'name': '수퍼맨레그리프트', 'details': '수퍼맨 레그 리프트는 허리와 다리 근육을 강화시키는 운동입니다.', 'cautions': '허리에 무리가 가지 않도록 주의하세요.', 'reps': '하루에 15회씩 3세트', 'calories': '약 6칼로리 소모' },
  ],
  };

const getRandomGreeting = () => {
  const greetings = [
    "안녕하세요! 무엇을 도와드릴까요?",
    "반갑습니다! 어떤 운동 정보를 찾고 계신가요?",
    "안녕하세요! 운동 이름을 입력해 주세요.",
    "환영합니다! 어떤 운동에 대해 알고 싶으세요?",
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
};

const getRandomResponse = (workout) => {
  const responses = [
    `좋아요! ${workout.name}에 대해 알려드릴게요.`,
    `확인했습니다! ${workout.name}에 대해 자세히 설명드릴게요.`,
    `알겠습니다! ${workout.name}의 정보를 제공할게요.`,
    `물론이죠! ${workout.name}에 대해 알려드릴게요.`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const getRandomWorkout = (category) => {
  const workouts = workoutData[category];
  return workouts[Math.floor(Math.random() * workouts.length)];
};

const getRandomCategory = () => {
  const categories = Object.keys(workoutData);
  return categories[Math.floor(Math.random() * categories.length)];
};

export default function ChattingScreen({ navigation }) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('어서오세요~ 무엇을 도와드릴까요?');
  const [history, setHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      const savedHistory = await AsyncStorage.getItem('chatHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    };
    loadHistory();
  }, []);

  const handleSend = () => {
    const lowerInput = input.toLowerCase().replace(/\s+/g, '');
    let newResponse = '';

    if (lowerInput.includes('안녕')) {
      newResponse = '안녕하세요! 무엇을 도와드릴까요?';
    } else if (lowerInput.includes('추천')) {
      const randomCategory = getRandomCategory();
      const randomWorkout = getRandomWorkout(randomCategory);
      newResponse = `제가 추천하는 운동은 ${randomCategory} 운동 중에서 ${randomWorkout.name}입니다.`;
    } else {
      let foundResponse = false;
      Object.keys(workoutData).forEach(category => {
        workoutData[category].forEach(workout => {
          if (lowerInput.includes(workout.name.toLowerCase().replace(/\s+/g, ''))) {
            newResponse = `${getRandomResponse(workout)}\n\n운동 이름: ${workout.name}\n세부 사항: ${workout.details}\n주의 사항: ${workout.cautions}\n반복 횟수: ${workout.reps}\n칼로리 소모: ${workout.calories}`;
            foundResponse = true;
          }
        });
      });

      if (!foundResponse) {
        newResponse = '운동 정보를 찾을 수 없습니다. 정확한 운동 이름을 입력해 주세요.';
      }
    }

    setResponse(newResponse);
    setHistory([...history, { input, response: newResponse }]);
    setInput('');
  };

  const handleSaveHistory = async () => {
    try {
        await AsyncStorage.setItem('chatHistory', JSON.stringify(history));
        alert('채팅 기록이 저장되었습니다.');
    } catch (error) {
        console.error("Error saving chat history:", error);
    }
  };

  const handleGoHome = () => {
    navigation.navigate('Main'); // 홈으로 돌아가기
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chat</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleGoHome}>
            <Text style={styles.headerButtonText}>홈</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleSaveHistory}>
            <Text style={styles.headerButtonText}>저장</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.chatContainer}>
          {history.map((item, index) => (
            <View key={index} style={styles.chatItem}>
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{item.input}</Text>
              </View>
              <View style={styles.botBubble}>
                <Text style={styles.botText}>{item.response}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="운동 이름을 입력하세요"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>전송</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  chatContainer: {
    flex: 1,
    width: '100%',
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
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007BFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
