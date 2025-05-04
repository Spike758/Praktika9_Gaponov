import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import db from './database';

const GameDetail = ({ navigation, route }) => {
  const [game, setGame] = useState(null);
  const [genre, setGenre] = useState(null);

  const loadGame = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT games.*, genres.name as genre_name 
         FROM games LEFT JOIN genres ON games.genre_id = genres.id 
         WHERE games.id = ?`,
        [route.params.gameId],
        (_, { rows: { _array } }) => {
          setGame(_array[0]);
          setGenre(_array[0].genre_name);
        },
        (_, error) => console.log('Error loading game details:', error)
      );
    });
  };

  React.useEffect(() => {
    loadGame();
  }, []);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddGame', { gameId: route.params.gameId })}
        >
          <Text style={styles.editButton}>Редактировать</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleDelete = () => {
    Alert.alert(
      'Удаление игры',
      'Вы уверены, что хотите удалить эту игру?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql(
                'DELETE FROM games WHERE id = ?',
                [route.params.gameId],
                () => {
                  Alert.alert('Успех', 'Игра успешно удалена');
                  navigation.goBack();
                },
                (_, error) => Alert.alert('Ошибка', 'Не удалось удалить игру')
              );
            });
          },
        },
      ]
    );
  };

  if (!game) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{game.title}</Text>
      <Text style={styles.subtitle}>Разработчик: {game.developer}</Text>
      <Text style={styles.subtitle}>Дата выхода: {game.release_date}</Text>
      <Text style={styles.subtitle}>Жанр: {genre || 'Не указан'}</Text>
      <Text style={styles.subtitle}>Цена: ${game.price}</Text>
      <Text style={styles.subtitle}>Рейтинг: {'★'.repeat(game.rating)}</Text>
      
      <Text style={styles.descriptionTitle}>Описание:</Text>
      <Text style={styles.description}>{game.description || 'Описание отсутствует'}</Text>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <Text style={styles.deleteButtonText}>Удалить игру</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  deleteButton: {
    marginTop: 32,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editButton: {
    color: '#007AFF',
    marginRight: 16,
    fontWeight: 'bold',
  },
});

export default GameDetail;