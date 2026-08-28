import { getDb } from './database.js';
import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS = {
  allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'img'],
  allowedAttributes: {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'width', 'height']
  },
  allowedSchemes: ['http', 'https', 'mailto']
};

export class News {
  static sanitizeContent(content) {
    return sanitizeHtml(content, SANITIZE_OPTIONS);
  }

  static async create(title, content, newsDate, published = false) {
    const db = await getDb();
    const sanitizedContent = this.sanitizeContent(content);
    const result = await db.run(
      'INSERT INTO news (title, content, news_date, published) VALUES (?, ?, ?, ?)',
      [title, sanitizedContent, newsDate, published ? 1 : 0]
    );
    return result.lastID;
  }

  static async getAll() {
    const db = await getDb();
    return await db.all('SELECT * FROM news ORDER BY news_date DESC, created_at DESC');
  }

  static async getById(id) {
    const db = await getDb();
    return await db.get('SELECT * FROM news WHERE id = ?', [id]);
  }

  static async getPublished(limit = null) {
    const db = await getDb();
    let query = 'SELECT * FROM news WHERE published = 1 ORDER BY news_date DESC, created_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    return await db.all(query);
  }

  static async getPublishedById(id) {
    const db = await getDb();
    return await db.get('SELECT * FROM news WHERE id = ? AND published = 1', [id]);
  }

  static async update(id, title, content, newsDate, published) {
    const db = await getDb();
    const sanitizedContent = this.sanitizeContent(content);
    await db.run(
      'UPDATE news SET title = ?, content = ?, news_date = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, sanitizedContent, newsDate, published ? 1 : 0, id]
    );
  }

  static async delete(id) {
    const db = await getDb();
    await db.run('DELETE FROM news WHERE id = ?', [id]);
  }
}
