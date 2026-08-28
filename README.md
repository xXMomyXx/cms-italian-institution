# CMS per Istituzioni Pubbliche

Un CMS semplice e intuitivo progettato per gestire siti web di istituzioni pubbliche. Costruito con Node.js, Express, SQLite e EJS.

## Caratteristiche

### Admin
- **Login sicuro**: Autenticazione con bcrypt, credenziali memorizzate nel database
- **Gestione Pagine Statiche**: Creazione, modifica, eliminazione di pagine con slug personalizzato
- **Gestione Notizie**: Creazione, modifica, eliminazione di notizie con data
- **Stato Draft/Pubblicato**: Bozze private e contenuti pubblicati
- **Editor HTML**: Supporto per contenuti HTML nelle pagine e notizie (con sanitizzazione automatica)
- **Dashboard**: Visualizzazione rapida di pagine e notizie
- **Protezione CSRF**: Token CSRF su tutti i form admin

### Sito Pubblico
- **Homepage**: Mostra le 5 notizie più recenti
- **Pagina Notizie**: Lista completa di tutte le notizie pubblicate
- **Dettaglio Notizia**: Pagina dedicata per ogni notizia
- **Pagine Statiche**: Link dinamici nel menu per tutte le pagine pubblicate
- **Menu Dinamico**: Navigazione che si adatta ai contenuti disponibili
- **404 Handling**: Pagine non trovate o non pubblicate ritornano 404

### Design
- Interfaccia italiana completa
- Design pulito e responsivo
- CSS personalizzato (nessun framework CSS)
- Accessibilità e usabilità ottimizzate

## Requisiti

- Node.js >= 16.0.0
- npm

## Installazione

1. **Clona il repository**
```bash
git clone <repository-url>
cd cms-italian-institution
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Configura le variabili di ambiente** (opzionale - vedi sezione sotto)

4. **Crea e popola il database**
```bash
npm run seed
```

Questo comando crea il database SQLite con tabelle per pagine, notizie e admin, e popola con dati di esempio:
- 3 pagine statiche pubblicate (Chi Siamo, Contatti, Privacy)
- 3 notizie pubblicate
- 1 notizia in bozza (non visibile)
- 1 utente admin con le credenziali configurate

## Utilizzo

### Avvio del server

**Modalità produzione:**
```bash
npm start
```

**Modalità sviluppo (con auto-reload):**
```bash
npm run dev
```

Il server sarà disponibile su `http://localhost:3000`

## Variabili di Ambiente

Il progetto supporta le seguenti variabili di ambiente:

| Variabile | Descrizione | Default |
|-----------|-------------|---------|
| `PORT` | Porta su cui avviare il server | `3000` |
| `ADMIN_USERNAME` | Nome utente admin (usato dal seed script) | `admin` |
| `ADMIN_PASSWORD` | Password admin (usato dal seed script) | `admin123` |
| `SESSION_SECRET` | Secret per firmare i cookie di sessione | `change-this-secret-in-production` |

### Esempi di utilizzo

**Con credenziali personalizzate:**
```bash
ADMIN_USERNAME=pippo ADMIN_PASSWORD=nuovapass npm run seed
```

**Con porta e secret personalizzati:**
```bash
PORT=8080 SESSION_SECRET=mysecretkey123 npm start
```

**Per produzione (file .env):**
```bash
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=securepassword123
SESSION_SECRET=longrandombytesherethatshouldbechanged
```

## Accesso Admin

**URL:** `http://localhost:3000/admin/login`

**Credenziali (dipendono dalle variabili di ambiente al momento del seed):**

Con le impostazioni predefinite:
- Nome utente: `admin`
- Password: `admin123`

## Sicurezza

### Implementato ✓
- **Password hashing**: Bcrypt con 10 salt rounds (non sono mai memorizzate in plaintext)
- **Database-backed auth**: Credenziali salvate in database, non hardcoded
- **Configurazione via env var**: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`
- **CSRF protection**: Token CSRF su tutti i form admin (csurf middleware)
- **Content sanitization**: HTML pericoloso rimosso automaticamente con `sanitize-html`
- **Sessioni sicure**: Cookie `httpOnly` (previene XSS), timeout 1 ora di inattività
- **Foreign keys attivate**: PRAGMA foreign_keys ON nel database SQLite
- **Tutte le rotte admin protette**: Middleware di autenticazione su ogni endpoint `/admin/*`

### Considerazioni per la produzione
1. **Cambia `SESSION_SECRET`**: Deve essere una stringa casuale lunga e complessa
2. **HTTPS**: Usa HTTPS in produzione (i cookie di sessione richiedono connessione crittografata)
3. **Rate limiting**: Aggiungi rate limiting sul login per prevenire brute force
4. **Logging/Audit**: Implementa logging di tutte le operazioni admin
5. **Backup database**: Imposta backup automatici del database SQLite
6. **Aggiornamenti**: Mantieni Node.js e le dipendenze aggiornate
7. **Isolamento**: Esegui in un container/VM isolato con permessi minimali

## Struttura del Progetto

```
cms-italian-institution/
├── app.js                 # File principale (Express + CSRF)
├── package.json          # Dipendenze del progetto
├── db.sqlite             # Database SQLite (creato da seed.js)
├── models/
│   ├── database.js       # Inizializzazione database
│   ├── Admin.js          # Autenticazione (bcrypt + DB)
│   ├── Page.js           # Pagine statiche (con sanitizzazione HTML)
│   └── News.js           # Notizie (con sanitizzazione HTML)
├── routes/
│   ├── admin.js          # Rotte admin (tutte protette + CSRF)
│   └── public.js         # Rotte sito pubblico
├── views/
│   ├── admin/            # Template admin
│   │   ├── layout.ejs
│   │   ├── login.ejs
│   │   ├── dashboard.ejs
│   │   ├── pages/
│   │   │   ├── list.ejs
│   │   │   └── form.ejs
│   │   └── news/
│   │       ├── list.ejs
│   │       └── form.ejs
│   ├── public/           # Template sito pubblico
│   │   ├── layout.ejs
│   │   ├── home.ejs
│   │   ├── news-list.ejs
│   │   ├── news-detail.ejs
│   │   └── page.ejs
│   ├── 404.ejs
│   └── error.ejs
├── public/
│   └── style.css        # Stili CSS
└── scripts/
    └── seed.js          # Script per popolare il database
```

## Database Schema

### Tabella `admins`
- `id` - Identificatore univoco (INT, PK)
- `username` - Nome utente (TEXT, UNIQUE)
- `password_hash` - Hash bcrypt della password (TEXT)
- `created_at` - Data di creazione (DATETIME)

### Tabella `pages`
- `id` - Identificatore univoco (INT, PK)
- `title` - Titolo della pagina (TEXT)
- `slug` - Slug per URL (TEXT, UNIQUE)
- `content` - Contenuto HTML sanitizzato (TEXT)
- `published` - Stato pubblicazione (BOOLEAN)
- `created_at` - Data di creazione (DATETIME)
- `updated_at` - Data ultimo aggiornamento (DATETIME)

### Tabella `news`
- `id` - Identificatore univoco (INT, PK)
- `title` - Titolo della notizia (TEXT)
- `content` - Contenuto HTML sanitizzato (TEXT)
- `published` - Stato pubblicazione (BOOLEAN)
- `news_date` - Data della notizia (DATE)
- `created_at` - Data di creazione (DATETIME)
- `updated_at` - Data ultimo aggiornamento (DATETIME)

## API Routes

### Admin (tutte protette da autenticazione + CSRF)
- `GET /admin/login` - Pagina di login
- `POST /admin/login` - Invio credenziali (bcrypt compare)
- `GET /admin/logout` - Logout e distruzione sessione
- `GET /admin` - Dashboard
- `GET /admin/pages` - Lista pagine
- `GET /admin/pages/new` - Modulo nuova pagina
- `POST /admin/pages` - Crea nuova pagina
- `GET /admin/pages/:id/edit` - Modulo modifica pagina
- `POST /admin/pages/:id` - Aggiorna pagina
- `POST /admin/pages/:id/delete` - Elimina pagina
- `GET /admin/news` - Lista notizie
- `GET /admin/news/new` - Modulo nuova notizia
- `POST /admin/news` - Crea nuova notizia
- `GET /admin/news/:id/edit` - Modulo modifica notizia
- `POST /admin/news/:id` - Aggiorna notizia
- `POST /admin/news/:id/delete` - Elimina notizia

### Pubblico (senza autenticazione)
- `GET /` - Homepage con ultimi 5 notizie
- `GET /notizie` - Lista completa notizie pubblicate
- `GET /notizie/:id` - Dettaglio notizia pubblicata
- `GET /pagina/:slug` - Pagina statica pubblicata

## HTML Supportato

Il contenuto HTML viene automaticamente sanitizzato. Sono consentiti i seguenti tag:

**Formattazione testo:**
- `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
- `<p>`, `<br>`
- `<strong>`, `<em>`, `<u>`
- `<blockquote>`, `<code>`, `<pre>`

**Struttura:**
- `<ul>`, `<ol>`, `<li>`
- `<hr>`

**Media e link:**
- `<a>` (con attributi `href`, `title`)
- `<img>` (con attributi `src`, `alt`, `width`, `height`)

**Tag pericolosi rimossi automaticamente:**
- Script inline (`<script>`, `onclick`, etc.)
- Iframe, object, embed
- CSS personalizzato (`<style>`, `style` attribute)
- Event handlers non consentiti

## Performance

- Database SQLite è adatto a piccoli/medi progetti (fino a 10k notizie/pagine)
- Per grandi istituzioni con milioni di contenuti, considera PostgreSQL
- Nessun caching HTTP implementato di default (aggiungere se necessario)

## Sviluppo Futuro

Possibili miglioramenti:
- [ ] Gestione utenti multipli con ruoli/permessi
- [ ] Upload di file/immagini con storage
- [ ] Backup automatici del database
- [ ] Sistema di categorie per notizie
- [ ] SEO optimization (meta tags dinamici)
- [ ] Ricerca full-text nelle notizie
- [ ] Versioning/history dei contenuti
- [ ] API REST per headless CMS
- [ ] Dark mode nell'admin
- [ ] Supporto multi-lingua
- [ ] Rate limiting sul login
- [ ] Two-factor authentication

## Licenza

MIT

## Supporto

Per problemi o domande, apri un issue nel repository.
