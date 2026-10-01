# Sistema de Turnos SOME · Hospital de Yumbel

Aplicación web (React + Vite + Firebase) para llamar turnos en el SOME.

## Vistas
| Ruta | Quién la usa | Qué hace |
|---|---|---|
| `/` | Todos | Portada con accesos a Administración, Operadores y Visor |
| `/visor` | TV de la sala | Muestra el turno actual, los últimos llamados y reproduce la voz |
| `/login` | Operadores | Ingreso con RUT + contraseña |
| `/loginS` | Jefatura | Ingreso de administración |
| `/dashboard` | Según rol | Panel de operador (`ClientAdmin`) o de administración (`SuperAdmin`) |

## Estructura
```
src/
  App.jsx                    rutas + control de sesión/rol (desconecta al operador si el sistema cierra)
  firebase.js                configuración de Firebase
  lib/constants.js           módulos, correo super admin, logo, letras
  lib/utils.js               formatRut, formatRutDisplay, rutToEmail, formatTurn, nextTurn, initials
  lib/modules.js             referencias Firestore y ocupar/liberar módulos
  lib/schedule.js            horario del sistema: dentro/fuera de horario, horas en formato 24 h
  lib/theme.js               colores por área (operator, admin, visor) y AreaContext
  hooks/useClock.js          reloj en vivo
  hooks/useModulesStatus.js  estado en tiempo real de los módulos
  hooks/useSystemStatus.js   estado del sistema: interruptor de Jefatura + horario
  components/                vistas: Home, Login, LoginSuper, LoginForm, ClientAdmin,
                             SuperAdmin, UserView (visor), VisorStart, AppHeader, ManualTurnCard,
                             SystemSchedule (horario, dentro de "Ajuste manual" en Administración)
  components/ui/             piezas base: Button, Card, Field (Input/Select/Label), Badge,
                             Alert, Toggle, Avatar, Logo, LoadingScreen
public/logo-hospital.svg     logo del hospital (vectorizado); favicon.svg = versión ícono
public/audio/{es,en}/        voces: turno.mp3, A–Z.mp3, 0–99.mp3
generate_audio.cjs           regenera las voces con Google TTS (usa google-credentials.json)
```

## Sistema de diseño
Cada área tiene su color, el mismo que su botón en la portada:

| Área | Color | Dónde |
|---|---|---|
| Operadores | azul → índigo (`blue-600` → `indigo-600`) | `/login` y panel del operador |
| Administración | negro (`slate-950`) | `/loginS` y panel de administración |
| Visor | verde (`emerald-600` → `teal-600`) | `/visor` |

- La base es neutra de oficina: fondo `slate-50`, tarjetas blancas, bordes `slate-200`.
- Tipografía: **Plus Jakarta Sans** para la interfaz y **Space Grotesk** para números de turno.
- Cada vista declara su área con `<AreaContext.Provider value="operator|admin|visor">`. Los componentes de `ui/` toman el color solos (`useArea()`).
- Los colores de cada área se cambian en un solo lugar: `src/lib/theme.js`.
- Logo: `public/logo-hospital.svg`, usado desde `LOGO_URL` (`src/lib/constants.js`) y el componente `ui/Logo.jsx`. En la pestaña del navegador se usa la versión ícono (`public/favicon.svg`), porque a 16–32 px el texto del logo no se lee. Los originales y sus versiones PNG están en la carpeta `Logo_Hospital_Yumbel/`.
- **El visor (`UserView.jsx`) mantiene su diseño original a propósito.** No aplicarle `ui-root` ni cambiar las reglas `*` y `body` de `index.css`, porque el visor depende de ellas.
- Tailwind se carga por CDN. Las clases que solo aparecen dentro de la ventana flotante (modo compacto) están en `safelist`, en `index.html`.

## Firestore
- `users/{uid}`: rut, name, role (`operator` | `superuser`), isActive
- `system/config`: globalTurnLetter, globalTurnNumber, audioEnabled, audioLanguage
- `system/status`: isOpen (interruptor de Jefatura), scheduleEnabled, openTime, closeTime (`"HH:MM"`, 24 h)
- `system/modules_<id>`: letter, number, activeOperatorId, activeOperatorName, status
- `system/calls/history`: llamados (letter, number, moduleId, moduleName, timestamp en ms)

## Horario del sistema
- Se configura en Administración, al pie de "Ajuste manual". Con el horario activo, el sistema atiende solo entre la apertura y el cierre, todos los días.
- Fuera de horario nadie puede entrar como operador. A la hora de cierre, cada operador conectado libera su módulo y se desconecta solo, igual que con el cierre manual. Si el panel de administración está abierto, además libera los módulos que hayan quedado ocupados.
- El interruptor de la cabecera ("Sistema abierto") sigue mandando: si Jefatura cierra el sistema, queda cerrado hasta que lo vuelva a abrir, aunque sea horario de atención. Encendido pero fuera de horario se ve "Fuera de horario" (ámbar).
- No hay servidor (plan Spark): cada navegador aplica el horario con la hora de su computador. Un equipo con la hora mal configurada lo aplicará mal.

## Comandos
```
npm run dev      # desarrollo
npm run build    # compila a dist/
firebase deploy  # publica
```
Ver `GUIA_MUDANZA_HOSPITAL.md` para migrar a la cuenta del hospital.

Reglas para agentes de código (Antigravity/Gemini u otros): `AGENTS.md`. Antigravity lo lee solo en cada conversación.
