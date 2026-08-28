import express from 'express';
import csrf from 'csurf';
import { Admin } from '../models/Admin.js';
import { Page } from '../models/Page.js';
import { News } from '../models/News.js';

const router = express.Router();

// CSRF protection middleware (already applied at app level, but we pass it through routes)
const csrfProtection = csrf({ cookie: false });

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.admin) {
    return res.redirect('/admin/login');
  }
  next();
};

// Login page (no auth required, no CSRF needed for GET)
router.get('/login', (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin');
  }
  res.render('admin/login', { error: null, csrfToken: req.csrfToken() });
});

// Login submit (no auth required for POST, but has CSRF)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const admin = await Admin.authenticate(username, password);
    
    if (admin) {
      req.session.admin = { username: admin.username, id: admin.id };
      return res.redirect('/admin');
    }
    
    res.render('admin/login', { error: 'Nome utente o password non validi', csrfToken: req.csrfToken() });
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.render('admin/login', { error: 'Errore durante il login', csrfToken: req.csrfToken() });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Dashboard (protected)
router.get('/', requireAuth, async (req, res) => {
  const pages = await Page.getAll();
  const news = await News.getAll();
  res.render('admin/dashboard', { pages, news, csrfToken: req.csrfToken() });
});

// Pages (protected)
router.get('/pages', requireAuth, async (req, res) => {
  const pages = await Page.getAll();
  res.render('admin/pages/list', { pages, csrfToken: req.csrfToken() });
});

router.get('/pages/new', requireAuth, (req, res) => {
  res.render('admin/pages/form', { page: null, isEdit: false, csrfToken: req.csrfToken() });
});

router.post('/pages', requireAuth, async (req, res) => {
  const { title, slug, content, published } = req.body;
  
  if (!title || !slug || !content) {
    return res.render('admin/pages/form', {
      page: { title, slug, content },
      isEdit: false,
      error: 'Tutti i campi sono obbligatori',
      csrfToken: req.csrfToken()
    });
  }
  
  try {
    await Page.create(title, slug, content, published === 'on');
    res.redirect('/admin/pages');
  } catch (error) {
    res.render('admin/pages/form', {
      page: { title, slug, content },
      isEdit: false,
      error: 'Errore durante la creazione della pagina',
      csrfToken: req.csrfToken()
    });
  }
});

router.get('/pages/:id/edit', requireAuth, async (req, res) => {
  const page = await Page.getById(req.params.id);
  if (!page) {
    return res.status(404).render('404');
  }
  res.render('admin/pages/form', { page, isEdit: true, csrfToken: req.csrfToken() });
});

router.post('/pages/:id', requireAuth, async (req, res) => {
  const { title, slug, content, published } = req.body;
  
  if (!title || !slug || !content) {
    const page = await Page.getById(req.params.id);
    return res.render('admin/pages/form', {
      page: { ...page, title, slug, content },
      isEdit: true,
      error: 'Tutti i campi sono obbligatori',
      csrfToken: req.csrfToken()
    });
  }
  
  try {
    await Page.update(req.params.id, title, slug, content, published === 'on');
    res.redirect('/admin/pages');
  } catch (error) {
    const page = await Page.getById(req.params.id);
    res.render('admin/pages/form', {
      page: { ...page, title, slug, content },
      isEdit: true,
      error: 'Errore durante l\'aggiornamento della pagina',
      csrfToken: req.csrfToken()
    });
  }
});

router.post('/pages/:id/delete', requireAuth, async (req, res) => {
  await Page.delete(req.params.id);
  res.redirect('/admin/pages');
});

// News (protected)
router.get('/news', requireAuth, async (req, res) => {
  const news = await News.getAll();
  res.render('admin/news/list', { news, csrfToken: req.csrfToken() });
});

router.get('/news/new', requireAuth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.render('admin/news/form', { newsItem: null, isEdit: false, today, csrfToken: req.csrfToken() });
});

router.post('/news', requireAuth, async (req, res) => {
  const { title, content, news_date, published } = req.body;
  
  if (!title || !content || !news_date) {
    const today = new Date().toISOString().split('T')[0];
    return res.render('admin/news/form', {
      newsItem: { title, content, news_date },
      isEdit: false,
      today,
      error: 'Tutti i campi sono obbligatori',
      csrfToken: req.csrfToken()
    });
  }
  
  try {
    await News.create(title, content, news_date, published === 'on');
    res.redirect('/admin/news');
  } catch (error) {
    const today = new Date().toISOString().split('T')[0];
    res.render('admin/news/form', {
      newsItem: { title, content, news_date },
      isEdit: false,
      today,
      error: 'Errore durante la creazione della notizia',
      csrfToken: req.csrfToken()
    });
  }
});

router.get('/news/:id/edit', requireAuth, async (req, res) => {
  const newsItem = await News.getById(req.params.id);
  if (!newsItem) {
    return res.status(404).render('404');
  }
  const today = new Date().toISOString().split('T')[0];
  res.render('admin/news/form', { newsItem, isEdit: true, today, csrfToken: req.csrfToken() });
});

router.post('/news/:id', requireAuth, async (req, res) => {
  const { title, content, news_date, published } = req.body;
  
  if (!title || !content || !news_date) {
    const newsItem = await News.getById(req.params.id);
    const today = new Date().toISOString().split('T')[0];
    return res.render('admin/news/form', {
      newsItem: { ...newsItem, title, content, news_date },
      isEdit: true,
      today,
      error: 'Tutti i campi sono obbligatori',
      csrfToken: req.csrfToken()
    });
  }
  
  try {
    await News.update(req.params.id, title, content, news_date, published === 'on');
    res.redirect('/admin/news');
  } catch (error) {
    const newsItem = await News.getById(req.params.id);
    const today = new Date().toISOString().split('T')[0];
    res.render('admin/news/form', {
      newsItem: { ...newsItem, title, content, news_date },
      isEdit: true,
      today,
      error: 'Errore durante l\'aggiornamento della notizia',
      csrfToken: req.csrfToken()
    });
  }
});

router.post('/news/:id/delete', requireAuth, async (req, res) => {
  await News.delete(req.params.id);
  res.redirect('/admin/news');
});

export default router;
