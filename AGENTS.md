# Instrucciones para agentes de código · App Conteo

Sistema de Turnos del SOME del Hospital de Yumbel. **Está en uso real en el hospital: lo primero es no romper nada.**

- Stack: React 19 + Vite + Firebase (Auth + Firestore, plan Spark: sin Cloud Functions). Tailwind v3 se carga hoy por CDN, con su configuración en `index.html`.
- Antes de cambiar nada lee `README.md`: vistas, estructura, sistema de diseño y datos de Firestore.

## Cómo trabajar
- Responde en español.
- **Haz solo la tarea que te pido, una a la vez.** Si ves otros problemas, anótalos al final en vez de arreglarlos.
- Si algo no está claro o hay más de una forma razonable de hacerlo, pregúntame antes de empezar.
- **Edita los archivos directamente** y con cambios acotados. No crees scripts (`.cjs`, `.py`…) que reescriban código con expresiones regulares ni regeneres archivos completos desde cero: así se perdieron imports y se rompió el visor.
- **Reutiliza lo que ya existe** antes de escribir algo nuevo:
  - `src/lib/`: `constants.js` (módulos, letras de la fila, logo, correo del administrador), `utils.js` (RUT, formato de turno, `nextTurn`), `modules.js` (acceso a Firestore), `theme.js` (colores por área).
  - `src/hooks/`: `useClock`, `useModulesStatus`.
  - `src/components/ui/`: `Button`, `Card`/`CardHeader`, `Input`/`Select`/`Label`, `Badge`, `Alert`, `Toggle`, `Avatar`, `Logo`, `LoadingScreen`.
  - Piezas compartidas: `AppHeader`, `ManualTurnCard`, `LoginForm`.
  - No dupliques la lista de módulos, el logo, el reloj ni el formateo de RUT.
- No instales dependencias nuevas salvo que la tarea lo pida.
- Si un cambio deja desactualizado `README.md` o este archivo, actualízalos en la misma tarea.

## Diseño
- Cada área tiene su color, definido solo en `src/lib/theme.js`: operadores azul→índigo, administración negro (`slate-950`), visor verde. La base es neutra, de oficina: fondo `slate-50`, tarjetas blancas, bordes `slate-200`. No inventes colores nuevos.
- Usa los componentes de `src/components/ui/` en vez de escribir estilos a mano: toman solos el color del área (`AreaContext` / `useArea()`).
- **No modifiques el visor (`src/components/UserView.jsx`) ni las reglas `*` y `body` de `src/index.css`** salvo que te lo pida: el visor conserva su diseño original a propósito.
- Logo: siempre con `ui/Logo.jsx` o `LOGO_URL` (`public/logo-hospital.svg`). Nada de imágenes externas.
- Las clases de Tailwind que solo aparecen en la ventana flotante del modo compacto (Picture-in-Picture) tienen que estar en `safelist` (`index.html`).

## Datos
- **No cambies el formato de los datos en Firestore sin preguntarme.** En especial, `system/calls/history` guarda `timestamp` como número en milisegundos (`Date.now()`): el visor ordena el historial por ese campo, así que todos los llamados deben guardarlo igual.
- No cambies `firestore.rules` salvo que la tarea lo pida, y en ese caso explícame cada regla.

## No tocar
- `google-credentials.json`: credenciales de Google. No muestres su contenido, no lo copies ni lo subas (solo lo usa `generate_audio.cjs`).
- `_to_delete/` (respaldos), `dist/` y `.firebase/` (se generan solos).
- **No ejecutes `firebase deploy`** ni cambies nada en la consola de Firebase: la app está en producción y publico yo después de revisar.
- No borres archivos sin preguntarme.

## Al terminar cada tarea
1. `npm run lint`: 0 errores (la advertencia `react-hooks/exhaustive-deps` de `UserView.jsx` ya existía).
2. `npm run build`: sin fallos.
3. Si la carpeta tiene git, haz un commit con un mensaje en español que diga qué cambió.
4. Dime qué archivos cambiaste y cómo probarlo. Lo básico que siempre hay que revisar:
   - Portada: los 3 accesos funcionan.
   - Operador: login con RUT → elegir módulo → **Siguiente turno** → el visor muestra y anuncia el turno. **Repetir llamado** vuelve a sonar.
   - Modo compacto (PiP): abre y sus botones funcionan.
   - Administración: crear operador, editar, inhabilitar (el operador conectado es expulsado), liberar módulo y cerrar el sistema.
   - Visor en ES y EN, con audio activado y desactivado. Al recargarlo muestra los últimos llamados sin anunciarlos.
