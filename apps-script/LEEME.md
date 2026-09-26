# Activar el formulario de contacto (gratis, ~5 minutos)

Cada solicitud del formulario de `index.html` queda guardada en una hoja de Google Sheets
y llega como correo a **sodetteam2024@gmail.com**.

Hazlo con la cuenta de Google que quieres que envíe los avisos (idealmente sodetteam2024@gmail.com).

1. Entra a <https://script.google.com> y crea un **Proyecto nuevo**.
   (También sirve crearlo desde una hoja con **Extensiones → Apps Script**; en ese caso usa esa hoja.)
2. Borra lo que aparece en el editor y pega todo el contenido de `Codigo.gs`. Guarda (Ctrl+S).
3. Si lo creaste desde script.google.com, la primera ejecución crea en tu Drive una hoja
   llamada **"SODET – Solicitudes web"**. El registro de ejecución muestra el enlace.
4. **Dar permisos y probar:** en la barra de arriba elige la función `probar` y pulsa **Ejecutar**.
   - Google pedirá permisos. Si sale "Google no ha verificado esta aplicación", pulsa
     **Configuración avanzada → Ir a (nombre del proyecto)** y acepta. Es tu propio script.
   - Revisa: en el registro sale el enlace a la hoja (con una fila de prueba) y te llega un correo de prueba.
5. **Publicar:** botón **Implementar → Nueva implementación**.
   - Tipo (ícono del engranaje): **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
   - Pulsa **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).
6. Abre `index.html`, busca `const LEAD_ENDPOINT = '';` y pega la URL entre las comillas:

   ```js
   const LEAD_ENDPOINT = 'https://script.google.com/macros/s/XXXXXXXX/exec';
   ```

¡Listo! Llena el formulario en la página para probarlo de punta a punta.

## Cosas útiles

- **Cambiar el correo que recibe:** edita `DESTINO` en el script y vuelve a publicar con
  **Implementar → Gestionar implementaciones → editar (lápiz) → Versión: Nueva versión**.
  Así se conserva la misma URL. Si haces "Nueva implementación", la URL cambia.
- **Responder:** si el cliente dejó correo, al darle "Responder" al aviso le escribes directo a él.
  Si dejó celular, el correo trae un botón para abrir WhatsApp con su número.
- **Límite:** una cuenta gratuita de Gmail envía hasta unos 100 correos al día desde scripts.
- Mientras `LEAD_ENDPOINT` esté vacío, el formulario le ofrece al cliente enviar la misma
  información por WhatsApp, así que no se pierde ninguna solicitud.
