# Note sull'uso dell'AI

Per questo esercizio ho usato **GitHub Copilot** (piano free, modalità agentica in chat) per generare e iterare sul progetto. Di seguito i prompt principali usati, in ordine cronologico, e un caso concreto in cui ho dovuto correggere quanto proposto dall'AI.

## Prompt utilizzati

### 1. Setup iniziale del progetto

```
I need you to build a small CMS for a public institution's website, everything in Italian
(UI text, labels, error messages, README too). There's an admin side with login (just one
admin user, session-based) where I can create, edit and delete static pages (title, slug,
content, draft/published) and news items (title, date, content, draft/published). Then a
public site showing the latest published news on the homepage, a news list page, a news
detail page, and published static pages, all linked from a nav menu. Anything unpublished
or missing should return a 404. Use Node with Express and SQLite, server-side views with
EJS, no frontend framework, just some clean CSS so it doesn't look bare. Set up the project
structure (routes, views, models, a script to create/seed the db) and write a README with
instructions to run it locally.
```

Copilot ha generato l'intera struttura del progetto (routes, models, views, script di seed, CSS) e un README in italiano con istruzioni di avvio, coerente con quanto richiesto.

### 2. Correzione sicurezza — credenziali admin

```
the admin credentials are hardcoded in Admin.js and there's no password hashing, that's
not good even for a demo. move the admin user into the database with a bcrypt hash, seed
it from env vars (ADMIN_USERNAME, ADMIN_PASSWORD) in the seed script, and update the login
route to compare against the hash instead of a plaintext check
```

### 3. Hardening finale (rotte protette, sanitizzazione, CSRF, README)

```
a few more things to tighten up before I call this done. First, double check all /admin
routes are actually behind the session middleware, not just the ones visible in admin.js
— I want to make sure nobody can hit something like /admin/pages/new directly without
logging in first. Second, the news/page content is saved and rendered as raw HTML with no
sanitization, add sanitize-html (or similar) on save so dangerous tags/scripts get
stripped before it's stored. Third, add basic CSRF protection on the admin forms (csurf or
an equivalent) since right now nothing stops a forged POST from editing or deleting
content. Finally, clean up the README: remove the old "credentials are hardcoded" warning
since that's fixed now, and add a short section listing the required env vars
(ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET, whatever else is needed) to run the
project.
```

Da questo prompt Copilot ha aggiunto `sanitize-html` sul salvataggio di pagine e notizie, `csurf` sui form admin, verificato la protezione delle rotte `/admin/*`, e aggiornato il README con la sezione sulle variabili d'ambiente.

## Uso di Claude come supporto

Oltre a Copilot, che ho usato come strumento agentico principale per generare il progetto, ho usato **Claude** in una conversazione separata come supporto sia per formulare i prompt da dare a Copilot, sia — in un secondo momento — per il debug diretto di alcuni problemi emersi durante i test in locale, quando correggere tramite Copilot sarebbe stato più lento o rischioso (vedi casi 2 e 3 sotto). Claude ha anche curato la stesura di questo file di documentazione.

## Casi in cui ho corretto o respinto ciò che l'AI ha proposto

### 1. Credenziali admin hardcoded (Copilot)

Nella prima generazione, Copilot ha implementato il login admin con **credenziali hardcoded in chiaro** direttamente nel file `Admin.js` (`admin` / `admin123`, nessun hashing), limitandosi a segnalarlo come "nota di sicurezza" nel README invece di evitarlo a monte — una scelta accettabile per un mockup ma non per un sistema anche solo dimostrativo. Ho quindi chiesto esplicitamente di spostare l'utente admin nel database, con password hashata via **bcrypt** e credenziali iniziali lette da variabili d'ambiente (`ADMIN_USERNAME`, `ADMIN_PASSWORD`) nello script di seed, aggiornando di conseguenza la rotta di login per confrontare l'hash invece della password in chiaro.

### 2. Layout EJS non funzionante, risolto due volte male da Copilot

Testando il progetto in locale, la homepage restituiva l'errore `body is not defined`: le viste facevano un `include()` del layout ma non gli passavano mai il contenuto atteso. Ho chiesto a Copilot di sistemarlo; la sua correzione ha introdotto un pattern ancora più fragile — passare il contenuto della pagina come **template string JavaScript con tag EJS annidati dentro i backtick** — che ha rotto subito dopo con un nuovo errore (`Could not find matching close tag for "<%-"`), perché EJS analizza il file prima che il JavaScript venga eseguito e quindi non "vede" che quei tag sono dentro una stringa. A questo punto ho scelto di **non continuare a far correggere Copilot** (che stava producendo patch su patch instabili sullo stesso problema) e ho fatto riscrivere l'intera struttura delle viste da Claude, con un pattern EJS standard a partial (`header`/`footer`), senza aggiungere nuove dipendenze.

### 3. Form di creazione senza `action`, bug rimasto invisibile per più correzioni

Dopo aver sistemato il layout, pagine e notizie create dal pannello admin non comparivano nella lista né venivano pubblicate. Il problema non era, come si poteva sospettare, nei modelli o nel database: i form di creazione/modifica generati da Copilot (`<form method="POST">`) **non avevano l'attributo `action`**, quindi il browser inviava la richiesta all'URL corrente (es. `/admin/pages/new`, che ha solo una rotta GET) invece che alla rotta corretta (`/admin/pages`, con la rotta POST che salva davvero il contenuto). Il bug era presente fin dalla generazione iniziale di Copilot ma è rimasto nascosto per diversi giri di correzioni successive, perché il sintomo ("il contenuto non si salva") suggeriva un problema più a monte, nel database o nei modelli, piuttosto che una svista nell'HTML del form.
