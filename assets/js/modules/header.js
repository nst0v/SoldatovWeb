/**
 * Инициализация функциональности хедера
 */
export function initHeader() {
  // Активный пункт меню при прокрутке
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav ul li a');
  
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (window.scrollY >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === current) {
        link.classList.add('active');
      }
    });
  });
  
  // Мобильное меню
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav ul');
  const header = document.querySelector('.header');
  const body = document.body;
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      menuToggle.classList.toggle('active');
      header.classList.toggle('menu-open');
      body.classList.toggle('menu-open');
    });
    
    // Закрытие меню при клике на пункт
    document.querySelectorAll('.nav ul li a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
        header.classList.remove('menu-open');
        body.classList.remove('menu-open');
      });
    });
    
    // Закрытие меню при нажатии Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
        header.classList.remove('menu-open');
        body.classList.remove('menu-open');
      }
    });
  }
}