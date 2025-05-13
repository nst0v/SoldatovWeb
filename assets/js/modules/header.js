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
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
    
    // Закрытие меню при клике на пункт
    document.querySelectorAll('.nav ul li a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      });
    });
  }
}