# Guía de Migración: Sistema SOME - Hospital de Yumbel

Esta carpeta contiene todo el código listo y configurado. Cuando quieras subir esto a la cuenta de Google final (Plan Spark), solo debes seguir estos 4 pasos:

## Paso 1: Preparar Firebase
1. Entra a [Firebase Console](https://console.firebase.google.com/) con el correo de Google que administrará el proyecto.
2. Haz clic en **Crear Proyecto** y ponle un nombre (ej. `some-yumbel`).
3. En el menú izquierdo, entra a **Authentication** -> Comenzar -> Habilita **Correo electrónico/Contraseña**.
4. En el menú izquierdo, entra a **Firestore Database** -> Crear base de datos -> Iniciar en modo producción.

## Paso 2: Vincular el Código a la nueva Base de Datos
1. En Firebase, haz clic en el ícono de engranaje (Configuración del proyecto) -> **General**.
2. Baja hasta donde dice "Tus apps", haz clic en el ícono web (`</>`), ponle un apodo (ej. `web-some`) y regístrala.
3. Firebase te mostrará un código llamado `firebaseConfig`. Copia eso.
4. En esta carpeta de tu computador, abre el archivo `src/firebase.js` y **reemplaza el `firebaseConfig` antiguo por el nuevo**.

## Paso 3: Configurar a la Jefa (Super Admin)
Debes decirle al código cuál será el correo oficial que tendrá permisos de Super Administrador. Tienes que cambiar el correo actual (`17471333-2@some.cl`) por el nuevo en **DOS** lugares:

1. **Archivo 1:** Abre `src/lib/constants.js` y cambia:
   `export const SUPER_ADMIN_EMAIL = 'el-nuevo-correo@gmail.com';`
2. **Archivo 2:** Abre `firestore.rules` y busca la línea 7:
   `request.auth.token.email == "el-nuevo-correo@gmail.com" ||`

*(Nota: ¡No olvides crearle una cuenta a la jefa en la pestaña Authentication de Firebase con ese mismo correo y una clave!)*

## Paso 4: Subir a Internet (Desplegar)
Abre la terminal (consola) en esta misma carpeta y ejecuta estos 3 comandos en orden:

1. `firebase login` 
   *(Esto abrirá el navegador para que inicies sesión con la cuenta de Google dueña del proyecto).*
2. `firebase use --add`
   *(Esto te preguntará a qué proyecto de Firebase quieres subirlo. Elige el proyecto que acabas de crear).*
3. `npm run build && firebase deploy`
   *(Esto compilará el código y lo subirá a internet).*

¡Listo! La consola te entregará el link final (algo como `https://some-yumbel.web.app`) y el sistema funcionará para siempre.

---

## Qué hacer si se borra la cuenta del administrador por error

Por seguridad, la aplicación ya no crea sola la cuenta del administrador cuando falla el inicio de sesión. Si alguien la borra en **Authentication**, se restaura así:

1. Entra a la consola de Firebase del proyecto.
2. Ve a **Authentication → Users** y haz clic en **Add user**.
3. Crea el usuario con el correo del administrador (el de `SUPER_ADMIN_EMAIL` en `src/lib/constants.js`; hoy `17471333-2@some.cl`) y una contraseña segura.
4. Inicia sesión en `/loginS` con ese correo. Si en Firestore no existe su documento en `users`, la app lo crea sola con el rol `superuser` (lo hace `App.jsx`, solo para ese correo). El documento de la cuenta anterior queda sin uso y se puede borrar.
