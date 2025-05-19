export function initForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Получаем данные формы
            const formData = new FormData(contactForm);
            
            // Показываем индикатор загрузки
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Отправка...';
            submitButton.disabled = true;
            
            // Отправляем данные на сервер
            fetch('api/send_telegram.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                // Проверяем, успешен ли ответ
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP error! Status: ${response.status}, Response: ${text || 'Нет данных'}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                // Восстанавливаем кнопку
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                
                // Показываем сообщение об успехе или ошибке
                if (data.success) {
                    showNotification(data.message, 'success');
                    contactForm.reset(); // Очищаем форму при успешной отправке
                } else {
                    showNotification(data.message || 'Ошибка при обработке запроса', 'error');
                }
            })
            .catch(error => {
                // Восстанавливаем кнопку
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                
                // Показываем кастомное уведомление об ошибке
                showNotification('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.', 'error');
                
                // Предотвращаем всплытие ошибки в консоль браузера
                return false;
            });
            
            // Предотвращаем всплытие события и стандартное поведение
            return false;
        });
    }
}

// Функция для отображения уведомлений
function showNotification(message, type) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Добавляем на страницу
    document.body.appendChild(notification);
    
    // Показываем уведомление
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Скрываем и удаляем через 5 секунд
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}
