# Evento Halloween

Todos los archivos propios del evento están en esta carpeta:

- `halloween.css`: estilos del tema.
- `halloween.js`: activación, banner y ambiente.
- `halloween-sounds.js`: efectos y control de sonido.
- `assets/`: fondos e imágenes optimizadas, fuentes y documentación visual.
- `audio/`: sonidos, licencia, generadores y reproductor de prueba.
- `referencias/`: imágenes originales de referencia, excluidas del despliegue.
- `backup/`: respaldos históricos, excluidos de Git y del despliegue.
- `HALLOWEEN.md`: documentación e historial del diseño.
- `*.test.cjs`: pruebas del evento, excluidas del despliegue.

El evento permanece activado con `halloween: "on"` en `index.html`.
La página principal carga los archivos desde aquí y `service-worker.js`
mantiene sus rutas de caché y audio para la aplicación instalada.

Desde la raíz del proyecto:

```sh
node halloween/halloween.test.cjs
node halloween/halloween-sounds.test.cjs
```

Reproductor local: `/halloween/audio/halloween-preview.html`.
