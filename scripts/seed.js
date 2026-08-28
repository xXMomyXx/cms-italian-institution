import { initDb, getDb } from '../models/database.js';
import { Admin } from '../models/Admin.js';
import { Page } from '../models/Page.js';
import { News } from '../models/News.js';

async function seed() {
  try {
    await initDb();
    const db = await getDb();
    
    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    console.log('Inizializzazione del database...');
    
    // Clear existing data
    await db.exec('DELETE FROM admins; DELETE FROM pages; DELETE FROM news;');
    
    // Create admin user
    console.log(`Creazione admin user: ${adminUsername}`);
    await Admin.create(adminUsername, adminPassword);
    console.log('Admin user creato con successo');
    
    // Seed pages
    await Page.create(
      'Chi Siamo',
      'chi-siamo',
      '<h1>Chi Siamo</h1><p>Siamo un\'istituzione pubblica dedicata al servizio della comunità. La nostra missione è fornire servizi di qualità ai nostri cittadini.</p>',
      true
    );
    
    await Page.create(
      'Contatti',
      'contatti',
      '<h1>Contatti</h1><p>Email: info@istituzione.it</p><p>Telefono: +39 (0) 1234 567890</p><p>Indirizzo: Via Roma 1, 00100 Roma</p>',
      true
    );
    
    await Page.create(
      'Privacy',
      'privacy',
      '<h1>Informativa sulla Privacy</h1><p>Le tue informazioni personali sono importanti per noi...</p>',
      true
    );
    
    // Seed news
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
    
    await News.create(
      'Inaugurazione della nuova ala della biblioteca',
      '<p>Con grande soddisfazione inauguriamo la nuova ala della nostra biblioteca municipale. Lo spazio, completamente rinnovato, ospita una ricca collezione di libri e materiali multimediali.</p>',
      today,
      true
    );
    
    await News.create(
      'Importante avviso per i cittadini',
      '<p>Si comunica che gli uffici comunali rimarranno chiusi nel pomeriggio di venerdì per lavori di manutenzione. Scusandoci per eventuali disagi, rimaniamo disponibili tramite i nostri canali online.</p>',
      yesterday,
      true
    );
    
    await News.create(
      'Risultati del concorso pubblico',
      '<p>Sono stati pubblicati i risultati del concorso pubblico per la selezione di personale amministrativo. Congratulazioni ai vincitori!</p>',
      twoDaysAgo,
      true
    );
    
    await News.create(
      'Notizia in bozza (non visibile)',
      '<p>Questa notizia non è ancora pubblicata e non sarà visibile sul sito pubblico fino a quando non verrà messa in pubblicazione.</p>',
      today,
      false
    );
    
    console.log('Database seedato con successo!');
    console.log(`\nCredenziali di accesso:`);
    console.log(`Username: ${adminUsername}`);
    console.log(`Password: ${adminPassword}`);
  } catch (error) {
    console.error('Errore durante il seed del database:', error);
    process.exit(1);
  }
}

seed();
