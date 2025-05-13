/**
 * Инициализация функциональности интерактивных карточек услуг
 */
export function initServices() {
    const cards = document.querySelectorAll('.card-featured, .services-secondary .card');
    const mainGrid = document.querySelector('.services-main');
    const secondaryGrid = document.querySelector('.services-secondary');
    
    if (!cards.length) return;
    
    cards.forEach(card => {
      // Обработчик клика по карточке
      card.addEventListener('click', function(e) {
        // Если клик был по кнопке закрытия, закрываем карточку
        if (e.target.closest('.close-btn')) {
          closeCard(this);
          e.stopPropagation();
          return;
        }
        
        // Если клик был по кнопке CTA, не открываем/закрываем карточку
        if (e.target.closest('.cta-button')) {
          e.stopPropagation();
          return;
        }
        
        // Если карточка уже активна, закрываем её
        if (this.classList.contains('active')) {
          closeCard(this);
        } else {
          // Закрываем все открытые карточки
          cards.forEach(c => {
            if (c.classList.contains('active')) {
              closeCard(c);
            }
          });
          
          // Открываем текущую карточку
          openCard(this);
        }
      });
    });
    
    // Закрытие карточек при клике вне их области
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.card-featured') && !e.target.closest('.services-secondary .card')) {
        cards.forEach(card => {
          if (card.classList.contains('active')) {
            closeCard(card);
          }
        });
      }
    });
    
    // Функция открытия карточки
    function openCard(card) {
      card.classList.add('active');
      
      // Определяем, к какой группе относится карточка
      const isMainCard = card.closest('.services-main');
      
      if (isMainCard) {
        mainGrid.classList.add('has-active-card');
      } else if (secondaryGrid) {
        secondaryGrid.classList.add('has-active-card');
      }
    }
    
    // Функция закрытия карточки
    function closeCard(card) {
      card.classList.remove('active');
      
      // Определяем, к какой группе относится карточка
      const isMainCard = card.closest('.services-main');
      
      if (isMainCard) {
        mainGrid.classList.remove('has-active-card');
      } else if (secondaryGrid) {
        secondaryGrid.classList.remove('has-active-card');
      }
    }
    
    // Обработка клавиши Escape для закрытия активной карточки
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        cards.forEach(card => {
          if (card.classList.contains('active')) {
            closeCard(card);
          }
        });
      }
    });
  }
  