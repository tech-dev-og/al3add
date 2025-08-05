import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config';

console.log('Main.tsx loaded');

// Set initial document direction and language
const savedLanguage = localStorage.getItem('i18nextLng') || 'ar';
document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = savedLanguage;

console.log('About to render App');
createRoot(document.getElementById("root")!).render(<App />);
console.log('App rendered');
