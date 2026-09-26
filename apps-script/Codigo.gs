/**
 * Formulario de contacto de index.html
 * Guarda cada solicitud en la hoja "Solicitudes" y envía un aviso por correo.
 * Instrucciones de instalación en LEEME.md.
 */

const DESTINO = 'sodetteam2024@gmail.com';
const HOJA = 'Solicitudes';

const CAMPOS = [
  ['fecha', 'Fecha'],
  ['nombre', 'Nombre'],
  ['negocio', 'Negocio'],
  ['sector', 'Tipo de negocio'],
  ['tamano', 'Tamaño'],
  ['procesos', 'Qué quiere digitalizar'],
  ['herramientas', 'Cómo lo maneja hoy'],
  ['detalle', 'Detalle'],
  ['celular', 'Celular / WhatsApp'],
  ['correo', 'Correo'],
  ['ciudad', 'Ciudad'],
];

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return responder({ ok: true }); // campo trampa: lo llenan los bots, no las personas

  const datos = { fecha: new Date() };
  CAMPOS.slice(1).forEach(([clave]) => {
    datos[clave] = String(p[clave] || '').trim().slice(0, 2000);
  });
  if (!datos.nombre || (!datos.celular && !datos.correo)) {
    return responder({ ok: false, error: 'Faltan datos de contacto' });
  }

  guardar(datos);
  avisar(datos);
  return responder({ ok: true });
}

/**
 * Si el script se creó desde una hoja (Extensiones → Apps Script) usa esa hoja.
 * Si se creó directo en script.google.com, crea una en tu Drive la primera vez y guarda su id.
 */
function obtenerLibro() {
  const activo = SpreadsheetApp.getActiveSpreadsheet();
  if (activo) return activo;

  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('HOJA_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (err) { /* la borraron: se crea otra */ }
  }
  const nuevo = SpreadsheetApp.create('SODET – Solicitudes web');
  nuevo.getSheets()[0].setName(HOJA);
  props.setProperty('HOJA_ID', nuevo.getId());
  return nuevo;
}

function guardar(datos) {
  // El candado evita que dos envíos simultáneos creen dos hojas o se pisen la fila.
  const candado = LockService.getScriptLock();
  candado.waitLock(20000);
  try {
    escribirFila(datos);
  } finally {
    candado.releaseLock();
  }
}

function escribirFila(datos) {
  const libro = obtenerLibro();
  const hoja = libro.getSheetByName(HOJA) || libro.insertSheet(HOJA);
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(CAMPOS.map(([, titulo]) => titulo));
    hoja.getRange(1, 1, 1, CAMPOS.length).setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  // Un apóstrofo delante evita que Sheets interprete "+57…" o "=…" como fórmula.
  hoja.appendRow(CAMPOS.map(([clave]) => {
    const v = datos[clave];
    return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
  }));
}

function avisar(datos) {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const filas = CAMPOS.slice(1)
    .filter(([clave]) => datos[clave])
    .map(([clave, titulo]) =>
      `<tr><td style="padding:8px 14px 8px 0;color:#5F5873;vertical-align:top;white-space:nowrap">${titulo}</td>` +
      `<td style="padding:8px 0;color:#2A0E42">${esc(datos[clave]).replace(/\n/g, '<br>')}</td></tr>`)
    .join('');

  let whatsapp = '';
  const tel = datos.celular.replace(/\D/g, '');
  if (tel) {
    const numero = tel.length === 10 && tel[0] === '3' ? '57' + tel : tel;
    whatsapp = `<p style="margin:22px 0 0"><a href="https://wa.me/${numero}" ` +
      `style="background:#17C29A;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-weight:600">Escribirle por WhatsApp</a></p>`;
  }

  const html =
    `<div style="font-family:Arial,sans-serif;font-size:15px;max-width:560px">` +
    `<h2 style="color:#5B1E86;font-weight:600;margin:0 0 6px">Nueva solicitud desde la web</h2>` +
    `<p style="color:#5F5873;margin:0 0 18px">${esc(datos.nombre)}${datos.negocio ? ' · ' + esc(datos.negocio) : ''}</p>` +
    `<table style="border-collapse:collapse;font-size:15px">${filas}</table>${whatsapp}</div>`;

  const texto = CAMPOS.slice(1)
    .filter(([clave]) => datos[clave])
    .map(([clave, titulo]) => `${titulo}: ${datos[clave]}`)
    .join('\n');

  const opciones = { name: 'Formulario SODET', htmlBody: html };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) opciones.replyTo = datos.correo;

  const quien = datos.negocio || datos.nombre;
  MailApp.sendEmail(DESTINO, `Nueva solicitud: ${quien} (${datos.sector})`, texto, opciones);
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Ejecútala una vez desde el editor para dar permisos y comprobar que llega el correo. */
function probar() {
  doPost({ parameter: {
    nombre: 'Prueba SODET',
    negocio: 'Conjunto de prueba',
    sector: 'Conjunto o edificio',
    tamano: 'Cuántas unidades tiene: 50 a 150',
    procesos: 'Cobrar la administración, Registrar visitantes',
    herramientas: 'Excel, WhatsApp',
    detalle: 'Esto es una prueba del formulario.',
    celular: '300 123 4567',
    correo: DESTINO,
    ciudad: 'Bogotá',
  } });
  Logger.log('Listo. Las solicitudes se guardan en: ' + obtenerLibro().getUrl());
}
