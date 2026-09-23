# pwa-estudiante

PWA del estudiante. Ver el README del repo (`../README.md`) para cómo arrancar el proyecto completo.

Específico de esta app:

- `vite-plugin-pwa` genera el manifest y el Service Worker.
- Requiere `VITE_VAPID_PUBLIC_KEY` en `.env` para Web Push.
- HTTPS obligatorio en desarrollo para probar Service Worker y notificaciones.
