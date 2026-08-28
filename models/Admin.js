import { getDb } from './database.js';
import bcrypt from 'bcrypt';

export class Admin {
  static async authenticate(username, password) {
    const db = await getDb();
    const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username]);
    
    if (!admin) {
      return false;
    }
    
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    return isValidPassword ? admin : false;
  }

  static async create(username, password) {
    const db = await getDb();
    const passwordHash = await bcrypt.hash(password, 10);
    
    try {
      const result = await db.run(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        [username, passwordHash]
      );
      return result.lastID;
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Nome utente già esistente');
      }
      throw error;
    }
  }

  static async isValidSession(admin) {
    return admin && admin.username;
  }
}
