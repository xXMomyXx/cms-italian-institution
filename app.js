import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import csrf from 'csurf';
import { fileURLToPath } from 'url';
import path from 'path';
import { initDb } from './models/database.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret-in-production';

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, maxAge: 3600000 } // 1 hour
}));

// CSRF protection
const csrfProtection = csrf({ cookie: false });

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global middleware for common variables
app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.admin;
  res.locals.admin = req.session.admin || null;
  next();
});

// Public routes (no CSRF needed)
app.use('/', publicRoutes);

// Admin routes with CSRF protection
app.use('/admin', csrfProtection, adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  
  // CSRF error handling
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('error', { error: 'Token CSRF non valido. Riprovare.' });
  }
  
  res.status(500).render('error', { error: err.message });
});

// Initialize database and start server
(async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`CMS in esecuzione su http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Errore durante l\'inizializzazione del database:', error);
    process.exit(1);
  }
})();
