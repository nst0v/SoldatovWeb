/**
 * Инициализация функциональности футера
 */
export function initFooter() {
    // Аккордеон для мобильной версии футера
    const footerHeadings = document.querySelectorAll('.footer-col:not(:first-child) h3');
    
    if (window.innerWidth <= 768) { // Проверяем, что это мобильное устройство
      footerHeadings.forEach(heading => {
        heading.addEventListener('click', () => {
          const parent = heading.parentElement;
          
          // Закрываем все другие колонки
          document.querySelectorAll('.footer-col.active').forEach(col => {
            if (col !== parent) {
              col.classList.remove('active');
            }
          });
          
          // Переключаем активное состояние текущей колонки
          parent.classList.toggle('active');
        });
      });
    }
    
    // Плавная прокрутка для кнопки "Наверх"
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
      backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }
  