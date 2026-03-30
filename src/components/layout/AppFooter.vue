<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="logo-icon">🐾</span>
        <span class="logo-text">ZooHome</span>
        <p>Найдите своего идеального питомца</p>
      </div>
      <div class="footer-links">
        <RouterLink to="/">Каталог</RouterLink>
        <RouterLink to="/bookings">Записи</RouterLink>
        <RouterLink to="/profile">Профиль</RouterLink>
      </div>
      <div class="footer-copy">
        © {{ new Date().getFullYear() }} ZooHome. Все права защищены.
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--charcoal);
  color: rgba(255,255,255,0.7);
  padding: 40px 0 30px;
  margin-top: auto;
}
.footer-inner {
  display: flex;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.logo-icon { font-size: 20px; }
.logo-text { font-family: var(--font-display); font-size: 18px; color: white; }
.footer-brand p { width: 100%; font-size: 13px; margin-top: 4px; color: rgba(255,255,255,0.5); }
.footer-links { display: flex; gap: 20px; margin-left: auto; }
.footer-links a { font-size: 14px; transition: color var(--transition); }
.footer-links a:hover { color: var(--moss); }
.footer-copy { width: 100%; font-size: 13px; color: rgba(255,255,255,0.35); padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }

@media (max-width: 600px) {
  .footer-links { margin-left: 0; }
}
</style>
