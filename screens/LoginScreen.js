import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import CryptoJS from 'crypto-js';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Both fields are required');
      return;
    }

    const fileUri = FileSystem.documentDirectory + 'users.csv';
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      const users = fileContent.split('\n').filter(Boolean).map(line => {
        const [username, hashedPassword, name, gender, address, age] = line.split(',');
        return { username, hashedPassword, name, gender, address, age };
      });

      const hashedPassword = CryptoJS.SHA256(password).toString();
      const user = users.find(u => u.username === username && u.hashedPassword === hashedPassword);
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        navigation.navigate('Main'); // Navigate to Main screen after successful login
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', `Could not read user data: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fitness Life Plus!</Text>
      <Text style={styles.subtitle}>어서오세요!</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="사용자 닉네임을 입력해주세요."
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호를 입력해주세요."
        placeholderTextColor="#aaa"
        secureTextEntry
      />
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>로그인 하기</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.registerButton}>
        <Text style={styles.registerButtonText}>회원가입 하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0094FF',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#7CF8FF',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    color: '#FFFFFF',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#495057',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#00CD48',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 20,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
