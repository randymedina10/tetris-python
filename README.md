# Tetris en Python
Proyecto personal de Randy A. Medina.

El motor de reglas está escrito en Python puro, separado de la interfaz HTML/CSS/JavaScript. Pyodide ejecuta Python en un Web Worker del navegador. No requiere backend, cuentas ni servicios de pago.

## Jugar localmente
```sh
python -m http.server 8000
```
Abrir http://localhost:8000. Se necesita conexión en la primera carga para descargar Pyodide desde jsDelivr. El botón Reintentar permite recuperarse de un error de red. No abrir el HTML mediante file://.

Siete piezas, bolsa aleatoria, rotación con ajuste en paredes, eliminación de líneas, puntuación, siguiente pieza, niveles, pausa y reinicio. Flechas para mover/girar, espacio para caída rápida y P para pausa. Controles táctiles incluidos. Versión sencilla: sin hold, ghost ni reglas oficiales de competición.

## Probar el motor
```sh
python -m unittest discover -s tests -v
```

Python no accede a ningún dato personal; la partida vive en memoria y se pierde al cerrar la página. El CDN recibe las solicitudes normales de descarga de recursos.

## Tecnología
[Pyodide](https://pyodide.org/en/stable/usage/quickstart.html), fijado a v314.0.6. Python estándar, sin paquetes adicionales.

