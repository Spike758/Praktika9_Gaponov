import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { initDatabase } from './database';

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const prepareDB = async () => {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (error) {
        console.error('Ошибка инициализации БД:', error);
      }
    };

    prepareDB();
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Инициализация базы данных...</Text>
      </View>
    );
  }


  return (
    <View>
      <Text>Приложение готово к работе!</Text>
    </View>
  );
}