import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Picker, Button, StyleSheet, Alert } from 'react-native';
import db from './database';

const GameForm = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [price, setPrice] = useState('');
  const [developer, setDeveloper] = useState('');
  const [rating, setRating] = useState(3);
  const [genreId, setGenreId] = useState(null);
  const [genres, setGenres] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [gameId, setGameId] = useState(null);

  useEffect(() => {
    loadGenres();
    
    if (route.params?.gameId) {
      setIsEditing(true);
      setGameId(route.params.gameId);
      loadGame(route.params.gameId);
    }
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

  const loadGame = (id) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM games WHERE id = ?',
        [id],
        (_, { rows: { _array } }) => {
          const game = _array[0];
          setTitle(game.title);
          setDescription(game.description);
          setReleaseDate(game.release_date);
          setPrice(game.price.toString());
          setDeveloper(game.developer);
          setRating(game.rating);
          setGenreId(game.genre_id);
        },
        (_, error) => console.log('Error loading game:', error)
      );
    });
  };

  const handleSubmit = () => {
    if (!title) {
      Alert.alert('Ошибка', 'Название игры обязательно');
      return;
    }

    const gameData = {
      title,
      description,
      release_date: releaseDate,
      price: parseFloat(price) || 0,
      developer,
      rating,
      genre_id: genreId,
    };

    if (isEditing) {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE games SET title = ?, description = ?, release_date = ?, price = ?, developer = ?, rating = ?, genre_id = ? WHERE id = ?',
          [...Object.values(gameData), gameId],
          () => {
            Alert.alert('Успех', 'Игра успешно обновлена');
            navigation.goBack();
          },
          (_, error) => Alert.alert('Ошибка', 'Не удалось обновить игру')
        );
      });
    } else {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO games (title, description, release_date, price, developer, rating, genre_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [...Object.values(gameData)],
          () => {
            Alert.alert('Успех', 'Игра успешно добавлена');
            navigation.goBack();
          },
          (_, error) => Alert.alert('Ошибка', 'Не удалось добавить игру')
        );
      });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Название игры"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Описание"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Дата выхода (ГГГГ-ММ-ДД)"
        value={releaseDate}
        onChangeText={setReleaseDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Цена"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Разработчик"
        value={developer}
        onChangeText={setDeveloper}
      />
      
      <Text style={styles.label}>Рейтинг:</Text>
      <Picker
        selectedValue={rating}
        onValueChange={itemValue => setRating(itemValue)}
        style={styles.picker}
      >
        {[1, 2, 3, 4, 5].map(num => (
          <Picker.Item key={num} label={'★'.repeat(num)} value={num} />
        ))}
      </Picker>
      
      <Text style={styles.label}>Жанр:</Text>
      <Picker
        selectedValue={genreId}
        onValueChange={itemValue => setGenreId(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Выберите жанр" value={null} />
        {genres.map(genre => (
          <Picker.Item key={genre.id} label={genre.name} value={genre.id} />
        ))}
      </Picker>
      
      <Button
        title={isEditing ? "Обновить игру" : "Добавить игру"}
        onPress={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  label: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  picker: {
    marginBottom: 16,
  },
});

export default GameForm;