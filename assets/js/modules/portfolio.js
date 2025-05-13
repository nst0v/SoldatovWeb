/**
 * Инициализация функциональности портфолио
 */
export function initPortfolio() {
  // Фильтрация портфолио
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-grid .item');
  
  if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Удаляем активный класс со всех кнопок
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Добавляем активный класс на нажатую кнопку
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        
        // Фильтруем элементы
        portfolioItems.forEach(item => {
          if (filter === 'all') {
            item.style.display = 'block';
          } else if (item.classList.contains(filter)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }
}