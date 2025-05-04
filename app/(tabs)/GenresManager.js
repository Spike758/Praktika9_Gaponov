import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import db from './database';

const GenresManager = ({ navigation }) => {
  const [genres, setGenres] = useState([]);
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreDescription, setNewGenreDescription] = useState('');

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM genres',
        [],
        (_, { rows: { _array } }) => setGenres(_array),
        (_, error) => console.log('Error loading genres:', error)
      );
    });
  };

  const handleAddGenre = () => {
    if (!newGenreName) {
      Alert.alert('Ошибка', 'Название жанра обязательно');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO genres (name, description) VALUES (?, ?)',
        [newGenreName, newGenreDescription],
        () => {
          setNewGenreName('');
          setNewGenreDescription('');
          loadGenres();
        },
        (_, error) => Alert.alert('Ошибка', 'Не удалось добавить жанр')
      );
    });
  };

  const handleDeleteGenre = (id) => {
    Alert.alert(
      'Удаление жанра',
      'Вы уверены, что хотите удалить этот жанр? Игры с этим жанром не будут удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql(
                'DELETE FROM genres WHERE id = ?',
                [id],
                () => loadGenres(),
                (_, error) => Alert.alert('Ошибка', 'Не удалось удалить жанр')
              );
            });
          },
        },
      ]
    );
  };

  const renderGenreItem = ({ item }) => (
    <View style={styles.genreItem}>
      <Text style={styles.genreName}>{item.name}</Text>
      {item.description && <Text style={styles.genreDescription}>{item.description}</Text>}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteGenre(item.id)}
      >
        <Text style={styles.deleteButtonText}>Удалить</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Управление жанрами</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Название жанра"
        value={newGenreName}
        onChangeText={setNewGenreName}
      />
      <TextInput
        style={styles.input}
        placeholder="Описание жанра"
        value={newGenreDescription}
        onChangeText={setNewGenreDescription}
        multiline
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddGenre}
      >
        <Text style={styles.addButtonText}>Добавить жанр</Text>
      </TouchableOpacity>
      
      <FlatList
        data={genres}
        renderItem={renderGenreItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<Text>Жанры не найдены</Text>}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  genreItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  genreName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  genreDescription: {
    marginTop: 4,
    color: '#666',
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
});

export default GenresManager;