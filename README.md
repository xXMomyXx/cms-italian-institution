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

3. **Configura le variabili di ambiente**

Prima di eseguire il seed, crea un file `.env` nella root del progetto con le variabili necessarie.

Esempio:

```env
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=securepassword123
SESSION_SECRET=longrandombytesherethatshouldbechanged
```

> **Nota:** il progetto utilizza le variabili d'ambiente tramite `process.env`. Se si utilizza un ambiente che carica automaticamente un file `.env`, inserire lì le variabili. In alternativa, è possibile impostarle direttamente nell'ambiente prima di eseguire i comandi.

Le variabili sono descritte in dettaglio nella sezione [Variabili di Ambiente](#variabili-di-ambiente).

4. **Crea e popola il database**

```bash
npm run seed
```

Questo comando crea il database SQLite con tabelle per pagine, notizie e admin, e popola con dati di esempio:

- 3 pagine statiche pubblicate (Chi Siamo, Contatti, Privacy)
- 3 notizie pubblicate
- 1 notizia in bozza (non visibile)
- 1 utente admin con le credenziali configurate tramite variabili d'ambiente

> **Attenzione:** `npm run seed` cancella i dati esistenti nelle tabelle `admins`, `pages` e `news` prima di ricreare i dati iniziali. Non eseguire il comando su un database contenente dati che si desidera conservare.

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

Il server sarà disponibile su:

```text
http://localhost:3000
```

La porta può essere modificata tramite la variabile d'ambiente `PORT`.

## Variabili di Ambiente

Il progetto supporta le seguenti variabili di ambiente:

| Variabile | Descrizione | Default |
|-----------|-------------|---------|
| `PORT` | Porta su cui avviare il server | `3000` |
| `ADMIN_USERNAME` | Nome utente admin usato dallo script di seed | `admin` |
| `ADMIN_PASSWORD` | Password admin usata dallo script di seed | `admin123` |
| `SESSION_SECRET` | Secret utilizzato per firmare i cookie di sessione | `change-this-secret-in-production` |

### Configurazione tramite `.env`

Per una configurazione più semplice, è possibile creare un file `.env` nella root del progetto e impostare le variabili, ad esempio:

```env
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=securepassword123
SESSION_SECRET=longrandombytesherethatshouldbechanged
```

Le credenziali definite in `ADMIN_USERNAME` e `ADMIN_PASSWORD` vengono utilizzate dallo script `npm run seed` per creare l'utente amministratore nel database.

**Importante:** il file `.env` può contenere informazioni sensibili e non deve essere committato nel repository.

### Esempi di utilizzo

**Con credenziali personalizzate:**

```bash
ADMIN_USERNAME=pippo ADMIN_PASSWORD=nuovapass npm run seed
```

**Con porta e secret personalizzati:**

```bash
PORT=8080 SESSION_SECRET=mysecretkey123 npm start
```

## Accesso Admin

**URL:**

```text
http://localhost:3000/admin/login
```

**Credenziali:** dipendono dalle variabili d'ambiente utilizzate al momento dell'esecuzione di `npm run seed`.

Con le impostazioni predefinite:

- Nome utente: `admin`
- Password: `admin123`

> **Avviso di sicurezza:** `admin` / `admin123` sono credenziali di default pensate esclusivamente per lo sviluppo e il test. Prima di qualsiasi utilizzo reale o deployment in produzione, impostare un nome utente e una password personalizzati tramite `ADMIN_USERNAME` e `ADMIN_PASSWORD`, quindi eseguire nuovamente il seed.

## Documentazione sull'uso dell'AI

Il progetto include il file [`AI_USAGE.md`](AI_USAGE.md), che documenta l'utilizzo dell'intelligenza artificiale durante lo sviluppo.

Il file contiene:
- i principali prompt utilizzati;
- gli strumenti AI utilizzati durante lo sviluppo;
- le modifiche richieste all'AI;
- gli errori introdotti dall'AI;
- i casi in cui le proposte dell'AI sono state analizzate, corrette o respinte.

Per maggiori dettagli sull'utilizzo dell'AI e sulle correzioni effettuate, consultare **AI_USAGE.md**.

## Sicurezza

### Implementato ✓

- **Password hashing**: Bcrypt con 10 salt rounds (le password non vengono mai memorizzate in plaintext)
- **Database-backed auth**: Credenziali salvate nel database, non hardcoded
- **Configurazione via env var**: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`
- **CSRF protection**: Token CSRF su tutti i form admin (`csurf` middleware)
- **Content sanitization**: HTML pericoloso rimosso automaticamente con `sanitize-html`
- **Sessioni sicure**: Cookie `httpOnly` (previene l'accesso al cookie tramite JavaScript), timeout di 1 ora
- **Foreign keys attivate**: `PRAGMA foreign_keys ON` nel database SQLite
- **Tutte le rotte admin protette**: Middleware di autenticazione su ogni endpoint di gestione `/admin/*`

### Considerazioni per la produzione

1. **Cambia `SESSION_SECRET`**: Deve essere una stringa casuale, lunga e complessa
2. **Cambia le credenziali admin**: Non utilizzare `admin` / `admin123` in un ambiente reale
3. **HTTPS**: Usa HTTPS in produzione e configura correttamente i cookie di sessione
4. **Rate limiting**: Aggiungi rate limiting sul login per prevenire attacchi brute force
5. **Logging/Audit**: Implementa logging delle operazioni amministrative
6. **Backup database**: Imposta backup automatici del database SQLite
7. **Aggiornamenti**: Mantieni Node.js e le dipendenze aggiornate
8. **Isolamento**: Esegui l'applicazione in un container/VM isolato con permessi minimali

## Struttura del Progetto

```text
cms-italian-institution/
├── app.js                      # File principale (Express + sessioni + CSRF)
├── package.json                # Dipendenze e script del progetto
├── package-lock.json           # Versioni bloccate delle dipendenze
├── db.sqlite                   # Database SQLite (creato da seed.js)
├── AI_USAGE.md                 # Documentazione sull'uso dell'AI
├── models/
│   ├── database.js             # Inizializzazione e connessione al database
│   ├── Admin.js                # Autenticazione (bcrypt + database)
│   ├── Page.js                 # Gestione pagine e sanitizzazione HTML
│   └── News.js                 # Gestione notizie e sanitizzazione HTML
├── routes/
│   ├── admin.js                # Rotte admin protette
│   └── public.js               # Rotte del sito pubblico
├── views/
│   ├── admin/                  # Template dell'area amministrativa
│   │   ├── dashboard.ejs
│   │   ├── login.ejs
│   │   ├── pages/
│   │   │   ├── list.ejs
│   │   │   └── form.ejs
│   │   └── news/
│   │       ├── list.ejs
│   │       └── form.ejs
│   ├── public/                 # Template del sito pubblico
│   │   ├── home.ejs
│   │   ├── news-list.ejs
│   │   ├── news-detail.ejs
│   │   └── page.ejs
│   ├── partials/               # Componenti EJS condivisi
│   │   ├── admin-header.ejs
│   │   ├── admin-footer.ejs
│   │   ├── public-header.ejs
│   │   └── public-footer.ejs
│   ├── 404.ejs
│   └── error.ejs
├── public/
│   └── style.css               # Stili CSS
└── scripts/
    └── seed.js                 # Script per creare e popolare il database
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
- `POST /admin/login` - Invio credenziali (confronto tramite bcrypt)
- `GET /admin/logout` - Logout e distruzione della sessione
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

- `GET /` - Homepage con le ultime 5 notizie
- `GET /notizie` - Lista completa delle notizie pubblicate
- `GET /notizie/:id` - Dettaglio di una notizia pubblicata
- `GET /pagina/:slug` - Pagina statica pubblicata

## HTML Supportato

Il contenuto HTML viene automaticamente sanitizzato prima di essere salvato nel database. Sono consentiti i seguenti tag:

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

- Script inline (`<script>`, `onclick`, ecc.)
- Iframe, object, embed
- CSS personalizzato (`<style>`, attributo `style`)
- Event handlers non consentiti

## Performance

- Il database SQLite è adatto a piccoli/medi progetti (fino a circa 10k notizie/pagine, in base al carico e all'ambiente)
- Per grandi istituzioni con milioni di contenuti, considera PostgreSQL
- Nessun caching HTTP implementato di default (aggiungere se necessario)

## Sviluppo Futuro

Possibili miglioramenti:

- [ ] Gestione utenti multipli con ruoli/permessi
- [ ] Upload di file/immagini con storage
- [ ] Backup automatici del database
- [ ] Sistema di categorie per notizie
- [ ] SEO optimization (meta tag dinamici)
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