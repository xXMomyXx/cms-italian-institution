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

export class Page {
  static sanitizeContent(content) {
    return sanitizeHtml(content, SANITIZE_OPTIONS);
  }

  static async create(title, slug, content, published = false) {
    const db = await getDb();
    const sanitizedContent = this.sanitizeContent(content);
    const result = await db.run(
      'INSERT INTO pages (title, slug, content, published) VALUES (?, ?, ?, ?)',
      [title, slug, sanitizedContent, published ? 1 : 0]
    );
    return result.lastID;
  }

  static async getAll() {
    const db = await getDb();
    return await db.all('SELECT * FROM pages ORDER BY created_at DESC');
  }

  static async getById(id) {
    const db = await getDb();
    return await db.get('SELECT * FROM pages WHERE id = ?', [id]);
  }

  static async getBySlug(slug, published = true) {
    const db = await getDb();
    if (published) {
      return await db.get('SELECT * FROM pages WHERE slug = ? AND published = 1', [slug]);
    }
    return await db.get('SELECT * FROM pages WHERE slug = ?', [slug]);
  }

  static async getPublished() {
    const db = await getDb();
    return await db.all('SELECT * FROM pages WHERE published = 1 ORDER BY title');
  }

  static async update(id, title, slug, content, published) {
    const db = await getDb();
    const sanitizedContent = this.sanitizeContent(content);
    await db.run(
      'UPDATE pages SET title = ?, slug = ?, content = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, slug, sanitizedContent, published ? 1 : 0, id]
    );
  }

  static async delete(id) {
    const db = await getDb();
    await db.run('DELETE FROM pages WHERE id = ?', [id]);
  }
}
