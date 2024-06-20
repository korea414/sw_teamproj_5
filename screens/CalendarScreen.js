import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ToastAndroid, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import { FontAwesome } from '@expo/vector-icons';

const workoutTypes = {
  전신: [
    { name: '버피', timeBased: false },
    { name: '마운틴 클라이머', timeBased: false },
    { name: '점프 스쿼트', timeBased: false },
    { name: '플랭크', timeBased: true },
    { name: '하이 니즈', timeBased: true },
    { name: '스타 점프', timeBased: false },
    { name: '크로스 잭', timeBased: false },
    { name: '인치웜', timeBased: false },
    { name: '스케이터 스텝', timeBased: false },
    { name: '스파이더맨 플랭크', timeBased: false },
  ],
  상체: [
    { name: '푸시업', timeBased: false },
    { name: '트라이셉스 딥스', timeBased: false },
    { name: '플랭크 숄더 탭', timeBased: true },
    { name: '다이아몬드 푸시업', timeBased: false },
    { name: '슈퍼맨', timeBased: true },
    { name: '베어 크롤', timeBased: true },
    { name: '팔벌려 뛰기', timeBased: false },
    { name: '플랭크 업다운', timeBased: false },
    { name: '파이크 푸시업', timeBased: false },
  ],
  하체: [
    { name: '스쿼트', timeBased: false },
    { name: '런지', timeBased: false },
    { name: '글루트 브릿지', timeBased: false },
    { name: '카프 레이즈', timeBased: false },
    { name: '월 시트', timeBased: true },
    { name: '사이드 런지', timeBased: false },
    { name: '돈키 킥', timeBased: false },
    { name: '서클 레그 리프트', timeBased: false },
    { name: '수퍼맨 레그 리프트', timeBased: false },
  ],
};

const CalendarScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [workouts, setWorkouts] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [workoutType, setWorkoutType] = useState(null); 
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [timeBased, setTimeBased] = useState(false); 
  const [duration, setDuration] = useState(''); 
  const [markedDates, setMarkedDates] = useState({});
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@workouts');
        if (jsonValue != null) {
          const storedWorkouts = JSON.parse(jsonValue);
          setWorkouts(storedWorkouts);
          setMarkedDates(getMarkedDates(storedWorkouts));
        }
      } catch (e) {
        console.error('Error loading data', e);
      }
    };
    loadData();
  }, []);

  const storeData = async (newWorkouts) => {
    try {
      const jsonValue = JSON.stringify(newWorkouts);
      await AsyncStorage.setItem('@workouts', jsonValue);
    } catch (e) {
      console.error('Error saving data', e);
    }
  };

  const getMarkedDates = (workouts) => {
    const marked = {};
    Object.keys(workouts).forEach(date => {
      if (workouts[date].length > 0) {
        marked[date] = { marked: true, dotColor: 'blue' }; 
      }
    });
    return marked;
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const handleSaveWorkoutDetail = () => {
    const setsInt = parseInt(sets, 10);
    const repsInt = parseInt(reps, 10);
    const durationInt = parseInt(duration, 10);
    if (!workoutType) {
      Alert.alert('오류', '운동 유형을 선택해주세요.');
      return;
    }
    if (!selectedWorkout) {
      Alert.alert('오류', '구체적인 운동을 선택해주세요.');
      return;
    }
    if (timeBased) {
      if (!(durationInt > 0 && durationInt <= 180)) {
        Alert.alert('오류', '유효한 시간을 입력해주세요.(1~180초)');
        return;
      }
    } else {
      if (!(setsInt >= 1 && setsInt <= 100)) {
        Alert.alert('오류', '세트는 1 이상 100 이하로 입력해주세요.');
        return;
      }
  
      if (!(repsInt >= 1 && repsInt <= 100)) {
        Alert.alert('오류', '횟수는 1 이상 100 이하로 입력해주세요.');
        return;
      }
    }
    const workoutDetail = {
      type: workoutType,
      name: selectedWorkout.name,
      timeBased: selectedWorkout.timeBased,
      ...(timeBased ? { duration: durationInt } : { sets: setsInt, reps: repsInt }),
    };
    const newWorkouts = {
      ...workouts,
      [selectedDate]: [
        ...(workouts[selectedDate] || []),
        workoutDetail
      ],
    };
    storeData(newWorkouts);
    setWorkouts(newWorkouts);
    setModalVisible(false);
    setMarkedDates(getMarkedDates(newWorkouts));
    setSets('');
    setReps('');
    setDuration('');
  };  

  const confirmDeleteWorkout = (dateString, index) => {
    Alert.alert(
      "운동 삭제", 
      "이 운동을 삭제하시겠습니까?", 
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", onPress: () => deleteWorkout(dateString, index) }
      ]
    );
  };

  const deleteWorkout = (dateString, index) => {
    const updatedWorkouts = { ...workouts };
    updatedWorkouts[dateString].splice(index, 1);
    if (updatedWorkouts[dateString].length === 0) {
      delete updatedWorkouts[dateString];
    }
    setWorkouts(updatedWorkouts);
    storeData(updatedWorkouts);
    setMarkedDates(getMarkedDates(updatedWorkouts));
    showToast('운동이 삭제되었습니다.');
  };

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const renderWorkoutInfo = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const dailyWorkouts = workouts[dateString];
    let workoutInfoElements = [];

    if (dailyWorkouts && dailyWorkouts.length > 0) {
      workoutInfoElements = dailyWorkouts.map((workout, index) => (
        <TouchableOpacity
          key={index}
          style={styles.workoutItem}
          onPress={() => confirmDeleteWorkout(dateString, index)}
        >
          <Text style={styles.workoutText}>
            {`${workout.type}: ${workout.name}, `}
            {workout.timeBased ? `지속 시간: ${workout.duration}초` : `세트: ${workout.sets}, 횟수: ${workout.reps}`}
          </Text>
        </TouchableOpacity>
      ));
    }

    return workoutInfoElements.length > 0 ? workoutInfoElements : <Text style={styles.noWorkoutText}>운동 계획 없음</Text>;
  };

  const placeholder = {
    label: '선택...',
    value: null,
    color: '#9EA0A4', 
  };

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);

  const calculateBMI = () => {
    const heightInMeters = height / 100; // 센티미터를 미터로 변환
    const bmiValue = weight / (heightInMeters * heightInMeters);
    setBmi(bmiValue.toFixed(2)); // 소수점 둘째 자리까지 표시
  };

  const handleGoHome = () => {
    navigation.navigate('Main'); // 홈으로 돌아가기
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <FontAwesome name="home" size={24} color="white" />
      </TouchableOpacity>
      <Calendar
        current={selectedDate}
        minDate={'2023-01-01'}
        maxDate={'2029-12-31'}
        onDayPress={handleDayPress}
        monthFormat={'yyyy MM'}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: '#4285F4',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#4285F4',
          arrowColor: '#4285F4',
          dotColor: '#4285F4',
          selectedDotColor: '#ffffff',
        }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>운동 추가</Text>
          <RNPickerSelect
            onValueChange={(value) => {
              setWorkoutType(value);
              setSelectedWorkout(null);
            }}
            items={Object.keys(workoutTypes).map((type) => ({ label: type, value: type }))}
            placeholder={placeholder}
            value={workoutType}
            style={pickerSelectStyles}
          />
          <RNPickerSelect
            onValueChange={(value) => {
              const workoutObj = workoutTypes[workoutType]?.find(workout => workout.name === value);
              setSelectedWorkout(workoutObj);
              setTimeBased(workoutObj ? workoutObj.timeBased : false);
            }}
            items={workoutType ? workoutTypes[workoutType].map((workout) => ({
              label: workout.name,
              value: workout.name,
            })) : []}
            placeholder={placeholder}
            value={selectedWorkout ? selectedWorkout.name : ''}
            disabled={!workoutType}
            style={pickerSelectStyles}
          />
          {timeBased ? (
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="시간 (초)"
              keyboardType="numeric"
              maxLength={3}
            />
          ) : (
            <>
              <TextInput
                style={styles.input}
                value={sets}
                onChangeText={text => setSets(text.replace(/[^0-9]/g, ''))}
                placeholder="세트"
                keyboardType="numeric"
                maxLength={3}
              />
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={text => setReps(text.replace(/[^0-9]/g, ''))}
                placeholder="횟수"
                keyboardType="numeric"
                maxLength={3}
              />
            </>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveWorkoutDetail}>
              <Text style={styles.buttonText}>저장</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScrollView style={styles.scrollView}>
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutTitle}>오늘의 운동</Text>
          {renderWorkoutInfo(new Date())}
          <Text style={styles.workoutTitle}>내일의 운동</Text>
          {renderWorkoutInfo(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))}
        </View>
      </ScrollView>
      <View style={styles.bmiContainer}>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          placeholder="키 (cm)"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="체중 (kg)"
          keyboardType="numeric"
        />
        <TouchableOpacity style={[styles.button, styles.bmiButton]} onPress={calculateBMI}>
          <Text style={styles.buttonText}>BMI 계산</Text>
        </TouchableOpacity>
        {bmi && <Text style={styles.resultText}>당신의 BMI: {bmi}</Text>}
      </View>
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
  modalView: {
    margin: 20,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: '#ffffff',
  },
  workoutItem: {
    backgroundColor: '#ffffff', 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  workoutText: {
    fontSize: 16,
    color: '#333333',
  },
  noWorkoutText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  workoutInfo: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    marginBottom: 20,
  },
  workoutTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
    color: '#333333'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  saveButton: {
    backgroundColor: '#4285F4',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    marginTop: 20,
  },
  bmiContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    marginTop: 20,
  },
  bmiButton: {
    backgroundColor: '#4285F4',
    marginTop: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#333333',
    marginTop: 10,
    textAlign: 'center',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, 
    backgroundColor: '#ffffff',
    marginVertical: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#ffffff',
    marginVertical: 10,
  },
});

export default CalendarScreen;
