import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');

  const handleSignup = async () => {
    if (!username || !password || !name || !gender || !address || !age) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const hashedPassword = CryptoJS.SHA256(password).toString();
    const user = { username, hashedPassword, name, gender, address, age };
    const fileUri = FileSystem.documentDirectory + 'users.csv';

    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      let existingData = '';

      if (fileInfo.exists) {
        existingData = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      }

      const users = existingData.split('\n').filter(Boolean);
      const isUserExists = users.some(u => {
        const [existingUsername] = u.split(',');
        return existingUsername === username;
      });

      if (isUserExists) {
        Alert.alert('Error', 'Username already exists');
        return;
      }

      const newUser = `${username},${hashedPassword},${name},${gender},${address},${age}\n`;
      const newData = existingData + newUser;
      await FileSystem.writeAsStringAsync(fileUri, newData, { encoding: FileSystem.EncodingType.UTF8 });

      await AsyncStorage.setItem('user', JSON.stringify(user));

      Alert.alert('Success', 'User registered successfully', [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
    } catch (error) {
      Alert.alert('Error', `Could not register user: ${error.message}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>회원가입</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="아이디"
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호"
        placeholderTextColor="#aaa"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="이름"
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        value={gender}
        onChangeText={setGender}
        placeholder="성별"
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="주소"
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        placeholder="나이"
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity onPress={handleSignup} style={styles.button}>
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
        <Text style={styles.backButtonText}>로그인으로 돌아가기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#3366FF',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#3366FF',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 20,
    fontSize: 18,
    backgroundColor: '#E0E0FF',
    color: '#333',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#3366FF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: '#3366FF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
