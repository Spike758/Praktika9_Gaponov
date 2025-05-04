import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

const DB_NAME = 'games.db';
let dbInstance = null;

export async function openDatabase() {
 
  if (dbInstance) return dbInstance;

  const asset = Asset.fromModule(require('../../assets/games.db'));
  await asset.downloadAsync();

 
  const dbPath = `${FileSystem.documentDirectory}${DB_NAME}`;
  const info = await FileSystem.getInfoAsync(dbPath);

  if (!info.exists) {
    try {
      await FileSystem.copyAsync({
        from: asset.localUri,
        to: dbPath,
      });
    } catch (error) {
      console.error("Ошибка при копировании базы данных:", error);
    }
  }

 
  dbInstance = SQLite.openDatabase(DB_NAME);
  return dbInstance;
}
