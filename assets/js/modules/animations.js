/**
 * Инициализация анимаций на странице
 */
export function initAnimations() {
  const options = {
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      }
    });
  }, options);

  document.querySelectorAll(".fade-in, .slide-up").forEach(section => {
    observer.observe(section);
  });
}