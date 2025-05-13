// Импортируем модули для разных блоков
import { initHeader } from './modules/header.js';
import { initAnimations } from './modules/animations.js';
import { initPortfolio } from './modules/portfolio.js';
import { initContact } from './modules/contact.js';
import { initServices } from './modules/services.js';

// Инициализация всех модулей при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initAnimations();
  initPortfolio();
  initContact();
  initServices(); // Добавляем инициализацию модуля услуг
});
