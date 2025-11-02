import { applyTranslations } from './i18n.js';

// Импорты HTML
import headerHTML from '../html/partials/header.html';
import introHTML from '../html/partials/intro.html';
import proliveeventsHTML from '../html/partials/proliveevents.html';
import fleshHTML from '../html/partials/flesh.html';
import galleryHTML from '../html/partials/gallery.html';
import artistsHTML from '../html/partials/artists.html';
import contactsHTML from '../html/partials/contacts.html';
import footerHTML from '../html/partials/footer.html';

let partialsLoaded = false;

export const loadHTMLPartials = async (lazy = false) => {
  if (partialsLoaded && !lazy) {
    console.log('[HTML-LOADER] Partials already loaded');
    return;
  }

  const lang = localStorage.getItem('lang') || 'en';

  console.log('[HTML-LOADER] 🔄 Loading HTML partials...');

  // Вставляем HTML напрямую из импортированных строк
  const elements = {
    header: document.querySelector('header[data-html], .header'),
    intro: document.querySelector('section[data-html*="intro"], .intro'),
    proliveevents: document.querySelector('section[data-html*="proliveevents"], .proliveevents'),
    flesh: document.querySelector('section[data-html*="flesh"], .flesh'),
    gallery: document.querySelector('section[data-html*="gallery"], .gallery'),
    artists: document.querySelector('section[data-html*="artists"], .artists'),
    contacts: document.querySelector('section[data-html*="contacts"], .contacts'),
    footer: document.querySelector('footer[data-html], .footer')
  };

  try {
    // Вставляем HTML
    if (elements.header && headerHTML) {
      elements.header.innerHTML = headerHTML;
      console.log('[HTML-LOADER] ✅ Header loaded');
    }

    if (elements.intro && introHTML) {
      elements.intro.innerHTML = introHTML;
      console.log('[HTML-LOADER] ✅ Intro loaded');
    }

    if (elements.proliveevents && proliveeventsHTML) {
      elements.proliveevents.innerHTML = proliveeventsHTML;
      console.log('[HTML-LOADER] ✅ ProLiveEvents loaded');
    }

    if (elements.flesh && fleshHTML) {
      elements.flesh.innerHTML = fleshHTML;
      console.log('[HTML-LOADER] ✅ Flesh loaded');
    }

    if (elements.gallery && galleryHTML) {
      elements.gallery.innerHTML = galleryHTML;
      console.log('[HTML-LOADER] ✅ Gallery loaded');
    }

    if (elements.artists && artistsHTML) {
      elements.artists.innerHTML = artistsHTML;
      console.log('[HTML-LOADER] ✅ Artists loaded');
    }

    if (elements.contacts && contactsHTML) {
      elements.contacts.innerHTML = contactsHTML;
      console.log('[HTML-LOADER] ✅ Contacts loaded');
    }

    if (elements.footer && footerHTML) {
      elements.footer.innerHTML = footerHTML;
      console.log('[HTML-LOADER] ✅ Footer loaded');
    }

    if (!lazy) {
      partialsLoaded = true;
    }

    const event = new CustomEvent('partialsLoaded');
    document.dispatchEvent(event);
    
    console.log('[HTML-LOADER] ✅ All HTML partials loaded successfully');

  } catch (error) {
    console.error('[HTML-LOADER] ❌ Error loading HTML partials:', error);
  }
};