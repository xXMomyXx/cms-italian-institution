import express from 'express';
import { Page } from '../models/Page.js';
import { News } from '../models/News.js';

const router = express.Router();

// Homepage
router.get('/', async (req, res) => {
  const latestNews = await News.getPublished(5);
  const pages = await Page.getPublished();
  res.render('public/home', { latestNews, pages });
});

// News list
router.get('/notizie', async (req, res) => {
  const news = await News.getPublished();
  const pages = await Page.getPublished();
  res.render('public/news-list', { news, pages });
});

// News detail
router.get('/notizie/:id', async (req, res) => {
  const newsItem = await News.getPublishedById(req.params.id);
  if (!newsItem) {
    return res.status(404).render('404');
  }
  const pages = await Page.getPublished();
  res.render('public/news-detail', { newsItem, pages });
});

// Static pages
router.get('/pagina/:slug', async (req, res) => {
  const page = await Page.getBySlug(req.params.slug, true);
  if (!page) {
    return res.status(404).render('404');
  }
  const pages = await Page.getPublished();
  res.render('public/page', { page, pages });
});

export default router;
