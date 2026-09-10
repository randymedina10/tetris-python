# Tetris: matrices, colisiones y gestión de estados

Proyecto de lógica desarrollado originalmente en Python y adaptado a JavaScript para ejecutarse directamente en el navegador. El motor modela un tablero de 20 × 10, siete tipos de piezas y una partida que aumenta de nivel con las líneas eliminadas.

## Evidencia técnica

- **Matrices:** tablero, piezas y rotaciones se representan como matrices bidimensionales.
- **Detección de colisiones:** verifica límites, bloques ocupados y posición antes de cada movimiento.
- **Gestión de estados:** pieza actual, siguiente pieza, puntuación, líneas, nivel, pausa y fin de partida.
- **Dificultad progresiva:** el nivel aumenta cada diez líneas.
- **Bolsa de siete piezas:** cada ciclo entrega una vez cada tetrominó antes de volver a mezclar.

## Reglas implementadas

- Movimiento horizontal, descenso, caída rápida y rotación.
- Ajustes laterales sencillos al rotar cerca de una pared.
- Bloqueo de pieza y eliminación simultánea de hasta cuatro líneas.
- Puntuación por descenso y por líneas según el nivel.
- Pausa, reinicio, vista de siguiente pieza y controles táctiles.

No incluye `hold`, pieza fantasma ni todas las reglas de un Tetris competitivo oficial.

## Arquitectura

```text
index.html + style.css     interfaz, panel y controles
          ↓
app.js                    bucle de juego y renderizado
          ↓
worker.js                 motor aislado de la interfaz
          ↓
tetris.py                 implementación original y reproducible
```

## Ejecutar en el navegador

```sh
python -m http.server 8000
```

Abrir `http://localhost:8000`. No abrir el HTML mediante `file://`, porque el navegador restringe la carga del Worker.

## Pruebas

```sh
python -m unittest discover -s tests -v
```

Las pruebas cubren eliminación de cuatro líneas, puntuación, límites, rotación, pausa, caída rápida, fin de partida, bolsa de siete piezas y acciones inválidas.

## Privacidad y alcance

La partida se ejecuta en memoria dentro del navegador. No existe backend, cuenta de usuario, telemetría ni almacenamiento de datos personales. El repositorio demuestra lógica, modelado de estados y pruebas, no una implementación oficial de Tetris.

