/**
 * Инициализация функциональности раздела услуг
 */
export function initServices() {
    // Обработка кликов по карточкам услуг
    const serviceCards = document.querySelectorAll('.services .card');
    
    if (serviceCards.length > 0) {
      serviceCards.forEach(card => {
        // Находим индикатор "Подробнее"
        const expandIndicator = card.querySelector('.expand-indicator');
        
        if (expandIndicator) {
          card.addEventListener('click', () => {
            // Проверяем, не активна ли уже карточка
            if (!card.classList.contains('active')) {
              // Находим родительский контейнер
              const container = card.closest('.services-main') || card.closest('.services-secondary');
              
              // Добавляем класс, указывающий, что есть активная карточка
              if (container) {
                container.classList.add('has-active-card');
              }
              
              // Активируем карточку
              card.classList.add('active');
              
              // Находим кнопку закрытия
              const closeBtn = card.querySelector('.close-btn');
              
              if (closeBtn) {
                // Добавляем обработчик для кнопки закрытия
                closeBtn.addEventListener('click', (e) => {
                  e.stopPropagation(); // Предотвращаем всплытие события
                  
                  // Удаляем класс активности с карточки
                  card.classList.remove('active');
                  
                  // Удаляем класс, указывающий на наличие активной карточки
                  if (container) {
                    container.classList.remove('has-active-card');
                  }
                });
              }
            } else {
              // Если карточка уже активна, то закрываем её при клике в любом месте
              // Находим родительский контейнер
              const container = card.closest('.services-main') || card.closest('.services-secondary');
              
              // Удаляем класс активности с карточки
              card.classList.remove('active');
              
              // Удаляем класс, указывающий на наличие активной карточки
              if (container) {
                container.classList.remove('has-active-card');
              }
            }
          });
        }
      });
    }
    
    // Добавляем обработчик для закрытия карточки при клике вне её
    document.addEventListener('click', (e) => {
      // Проверяем, не является ли цель клика или её родитель активной карточкой
      if (!e.target.closest('.card.active')) {
        // Находим все активные карточки
        const activeCards = document.querySelectorAll('.services .card.active');
        
        // Закрываем все активные карточки
        activeCards.forEach(activeCard => {
          // Находим родительский контейнер
          const container = activeCard.closest('.services-main') || activeCard.closest('.services-secondary');
          
          // Удаляем класс активности с карточки
          activeCard.classList.remove('active');
          
          // Удаляем класс, указывающий на наличие активной карточки
          if (container) {
            container.classList.remove('has-active-card');
          }
        });
      }
    });
  }
  