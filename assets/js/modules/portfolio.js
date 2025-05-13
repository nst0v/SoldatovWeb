/**
 * Инициализация функциональности портфолио
 */
export function initPortfolio() {
    // Инициализация слайдера портфолио
    initPortfolioSlider();
    
  }
  
  /**
   * Инициализация слайдера портфолио
   */
  function initPortfolioSlider() {
    const sliderContainer = document.querySelector('.portfolio-slider-container');
    const slider = document.querySelector('.portfolio-slider');
    const track = document.querySelector('.portfolio-track');
    
    if (!slider || !track) return;
    
    // Получаем все элементы
    const items = track.querySelectorAll('.item');
    
    if (items.length === 0) return;
    
    // Проверяем, является ли устройство мобильным
    const isMobile = window.innerWidth <= 768;
    
    // Клонируем элементы для создания бесконечной ленты (для всех устройств)
    const numberOfClones = Math.ceil(window.innerWidth / (items[0].offsetWidth + (isMobile ? 16 : 32))) * 3;
    
    // Удаляем существующие клоны, если они есть
    document.querySelectorAll('.clone').forEach(clone => clone.remove());
    
    // Создаем клоны и добавляем их в трек
    for (let i = 0; i < numberOfClones; i++) {
      const clone = items[i % items.length].cloneNode(true);
      clone.classList.add('clone');
      track.appendChild(clone);
    }
    
    // Создаем индикаторы для мобильных устройств
    if (isMobile) {
      createIndicators(items.length);
    }
    
    // Устанавливаем начальную позицию
    let position = 0;
    
    // Скорость прокрутки (пикселей в секунду)
    let normalScrollSpeed = isMobile ? 15 : 40; // Уменьшаем базовую скорость
    let currentScrollSpeed = normalScrollSpeed;
    
    // Последнее время обновления
    let lastTime = null;
    
    // Флаг для отслеживания, активно ли взаимодействие пользователя
    let userInteracting = false;
    
    // Таймер для возобновления автоматической прокрутки после взаимодействия
    let resumeTimer = null;
    
    // Функция анимации
    function animate(currentTime) {
      if (!lastTime) lastTime = currentTime;
      
      // Если пользователь взаимодействует с слайдером на мобильном, пропускаем анимацию
      if (isMobile && userInteracting) {
        lastTime = currentTime;
        requestAnimationFrame(animate);
        return;
      }
      
      // Вычисляем, сколько прошло времени с последнего обновления
      const deltaTime = currentTime - lastTime;
      
      // Обновляем позицию
      position -= currentScrollSpeed * (deltaTime / 1000);
      
      // Проверяем, нужно ли перемотать ленту
      const firstItemWidth = items[0].offsetWidth + parseInt(getComputedStyle(items[0]).marginRight);
      
      if (Math.abs(position) >= firstItemWidth * items.length) {
        position += firstItemWidth * items.length;
      }
      
      // Применяем трансформацию с плавностью
      track.style.transform = `translateX(${position}px)`;
      
      // Обновляем индикаторы на мобильных устройствах
      if (isMobile) {
        updateIndicators();
      }
      
      // Обновляем время последнего обновления
      lastTime = currentTime;
      
      // Запрашиваем следующий кадр анимации
      requestAnimationFrame(animate);
    }
    
    // Запускаем анимацию
    requestAnimationFrame(animate);
    
    // Замедление при наведении мыши (для десктопов)
    if (!isMobile) {
      track.addEventListener('mouseenter', () => {
        // Замедляем скорость, но не останавливаем полностью
        currentScrollSpeed = normalScrollSpeed * 0.3;
      });
      
      track.addEventListener('mouseleave', () => {
        // Возвращаем нормальную скорость
        currentScrollSpeed = normalScrollSpeed;
      });
    }
    
    // Обработчики для сенсорных устройств
    let touchStartX = 0;
    let touchStartY = 0;
    let initialPosition = 0;
    let lastTouchX = 0;
    let touchVelocity = 0;
    let lastTouchTime = 0;
    
    // Начало касания
    track.addEventListener('touchstart', (e) => {
      userInteracting = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      initialPosition = position;
      lastTouchX = touchStartX;
      lastTouchTime = Date.now();
      
      // Добавляем класс для плавного перехода при свайпе
      track.classList.add('touching');
      
      // Останавливаем автоматическую прокрутку
      clearTimeout(resumeTimer);
    }, { passive: true });
    
    // Движение пальцем
    track.addEventListener('touchmove', (e) => {
      if (!userInteracting) return;
      
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      
      // Вычисляем разницу по горизонтали и вертикали
      const diffX = touchX - touchStartX;
      const diffY = touchY - touchStartY;
      
      // Если вертикальное движение больше горизонтального, позволяем странице скроллиться
      if (Math.abs(diffY) > Math.abs(diffX)) {
        return;
      }
      
      // Предотвращаем прокрутку страницы
      e.preventDefault();
      
      // Рассчитываем скорость свайпа
      const now = Date.now();
      const dt = now - lastTouchTime;
      if (dt > 0) {
        touchVelocity = (touchX - lastTouchX) / dt;
      }
      lastTouchX = touchX;
      lastTouchTime = now;
      
      // Обновляем позицию трека с учетом движения пальца
      // Добавляем коэффициент сопротивления для более естественного ощущения
      position = initialPosition + diffX * 1.2;
      track.style.transform = `translateX(${position}px)`;
      
      // Обновляем индикаторы
      updateIndicators();
    }, { passive: false });
    
    // Конец касания
    track.addEventListener('touchend', (e) => {
      if (!userInteracting) return;
      
      // Удаляем класс плавного перехода
      track.classList.remove('touching');
      
      // Применяем инерцию после свайпа
      if (Math.abs(touchVelocity) > 0.5) {
        // Рассчитываем дополнительное смещение на основе скорости свайпа
        const momentum = touchVelocity * 100; // Коэффициент инерции
        position += momentum;
        
        // Применяем плавный переход для инерции
        track.style.transition = 'transform 0.5s cubic-bezier(0.1, 0.7, 0.1, 1)';
        track.style.transform = `translateX(${position}px)`;
        
        // Сбрасываем transition после завершения анимации
        setTimeout(() => {
          track.style.transition = '';
        }, 500);
      }
      
      // Возобновляем автоматическую прокрутку через 3 секунды
      resumeTimer = setTimeout(() => {
        userInteracting = false;
      }, 3000);
      
      // Сбрасываем скорость
      touchVelocity = 0;
    }, { passive: true });
    
    // Обработчики для индикаторов
    const indicators = document.querySelectorAll('.portfolio-indicators .indicator');
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        // Останавливаем автоматическую прокрутку
        userInteracting = true;
        clearTimeout(resumeTimer);
        
        // Прокручиваем к соответствующему элементу с плавной анимацией
        const itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(items[0]).marginRight);
        
        // Добавляем плавный переход
        track.style.transition = 'transform 0.5s cubic-bezier(0.1, 0.7, 0.1, 1)';
        
        // Устанавливаем новую позицию
        position = -(index * itemWidth);
        track.style.transform = `translateX(${position}px)`;
        
        // Сбрасываем transition после завершения анимации
        setTimeout(() => {
          track.style.transition = '';
        }, 500);
        
        // Обновляем активный индикатор
        updateIndicators();
        
        // Возобновляем автоматическую прокрутку через 3 секунды
        resumeTimer = setTimeout(() => {
          userInteracting = false;
        }, 3000);
      });
    });
    
    // Обновляем количество клонов при изменении размера окна
    window.addEventListener('resize', () => {
      // Проверяем, изменился ли тип устройства
      const wasIsMobile = isMobile;
      const newIsMobile = window.innerWidth <= 768;
      
      // Если тип устройства изменился, перезагружаем страницу
      if (wasIsMobile !== newIsMobile) {
        location.reload();
        return;
      }
      
      // Удаляем существующие клоны
      document.querySelectorAll('.portfolio-track .clone').forEach(clone => {
        clone.remove();
      });
      
      // Пересчитываем необходимое количество клонов
      const newNumberOfClones = Math.ceil(window.innerWidth / (items[0].offsetWidth + (newIsMobile ? 16 : 32))) * 3;
      
      // Создаем новые клоны
      for (let i = 0; i < newNumberOfClones; i++) {
        const clone = items[i % items.length].cloneNode(true);
        clone.classList.add('clone');
        track.appendChild(clone);
      }
    });
  }
  
  /**
   * Создает индикаторы для мобильного слайдера
   */
  function createIndicators(count) {
    const portfolioSection = document.querySelector('.portfolio');
    if (!portfolioSection) return;
    
    // Проверяем, существуют ли уже индикаторы
    let indicators = portfolioSection.querySelector('.portfolio-indicators');
    
    if (!indicators) {
      indicators = document.createElement('div');
      indicators.className = 'portfolio-indicators';
      
      // Создаем индикаторы
      for (let i = 0; i < count; i++) {
        const indicator = document.createElement('div');
        indicator.className = i === 0 ? 'indicator active' : 'indicator';
        indicators.appendChild(indicator);
      }
      
      // Добавляем индикаторы после слайдера
      const sliderContainer = portfolioSection.querySelector('.portfolio-slider-container');
      if (sliderContainer) {
        portfolioSection.insertBefore(indicators, sliderContainer.nextSibling);
      }
    }
  }
  
  /**
   * Обновляет активный индикатор при прокрутке
   */
  function updateIndicators() {
    const track = document.querySelector('.portfolio-track');
    const items = document.querySelectorAll('.portfolio-track .item:not(.clone)');
    const indicators = document.querySelectorAll('.portfolio-indicators .indicator');
    
    if (!track || !items.length || !indicators.length) return;
    
    // Получаем текущую позицию трека
    const transform = track.style.transform;
    const position = transform ? parseFloat(transform.replace('translateX(', '').replace('px)', '')) : 0;
    
    // Вычисляем ширину элемента
    const itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(items[0]).marginRight);
    
    // Вычисляем, какой элемент сейчас в центре видимой области
    // Используем модуль для обработки отрицательных позиций
    const normalizedPosition = -position % (itemWidth * items.length);
    const activeIndex = Math.round(normalizedPosition / itemWidth) % items.length;
    
    // Обновляем активный индикатор
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === activeIndex);
    });
  }