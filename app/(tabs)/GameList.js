import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import db from './database';

const GamesList = ({ navigation }) => {
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT games.*, genres.name as genre_name 
         FROM games LEFT JOIN genres ON games.genre_id = genres.id 
         WHERE games.title LIKE ?`,
        [`%${searchTerm}%`],
        (_, { rows: { _array } }) => {
          setGames(_array);
          setLoading(false);
        },
        (_, error) => {
          console.log('Error loading games:', error);
          setLoading(false);
        }
      );
    });
  };

  const renderGameItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.gameItem}
      onPress={() => navigation.navigate('GameDetail', { gameId: item.id })}
    >
      <Text style={styles.gameTitle}>{item.title}</Text>
      <Text>Жанр: {item.genre_name || 'Не указан'}</Text>
      <Text>Рейтинг: {'★'.repeat(item.rating)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Поиск по названию"
        value={searchTerm}
        onChangeText={text => {
          setSearchTerm(text);
          loadGames();
        }}
      />
      
      {loading ? (
        <Text>Загрузка...</Text>
      ) : (
        <FlatList
          data={games}
          renderItem={renderGameItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={<Text>Игры не найдены</Text>}
        />
      )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddGame')}
      >
        <Text style={styles.addButtonText}>Добавить игру</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  gameItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GamesList;