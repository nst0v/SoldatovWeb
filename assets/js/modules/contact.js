/**
 * Инициализация функциональности контактной формы
 */
export function initContact() {
  const contactForm = document.querySelector('#contact form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Здесь будет логика отправки формы
      // Например, через fetch API
      
      // Пример:
      const formData = new FormData(this);
      
      // Показываем сообщение об успешной отправке
      alert('Форма успешно отправлена! Мы свяжемся с вами в ближайшее время.');
      
      // Очищаем форму
      this.reset();
    });
  }
}