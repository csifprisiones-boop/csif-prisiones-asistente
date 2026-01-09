# Guía de Despliegue - CSIF Prisiones Asistente

Esta guía te explica cómo poner tu aplicación en internet para que puedas compartirla con tus compañeros.

## Requisitos Previos
- Tener acceso a tu proyecto en el Mac.
- Tener una cuenta en [Netlify](https://app.netlify.com/) (es gratuita).

---

## Paso 1: Generar la Versión de Producción
Este paso convierte todo tu código de programación en archivos simples que cualquier navegador puede leer.

1. Abre la terminal en la carpeta de tu proyecto.
2. Ejecuta el siguiente comando:
   ```bash
   npm run build
   ```
3. Verás que aparece una nueva carpeta llamada `dist` en tu proyecto. **Esta es la carpeta que vamos a subir.**

## Paso 2: Subir a Netlify
La forma más rápida de compartirla hoy mismo es usando "Netlify Drop":

1. Ve a [Netlify Drop](https://app.netlify.com/drop).
2. Arrastra la carpeta **`dist`** desde el Finder de tu Mac directamente a la ventana del navegador.
3. Espera unos segundos y Netlify te dará una dirección web (ejemplo: `nombre-aleatorio.netlify.app`).

## Paso 3: ¿Funciona la conexión a Supabase?
Como has usado "Netlify Drop" (arrastrar la carpeta), tus claves de Supabase ya se han incluido automáticamente dentro de los archivos al ejecutar `npm run build`.

**Si la web NO carga tus datos o da errores:**
1. Asegúrate de que el archivo `.env.local` en tu Mac tiene las claves correctas.
2. Vuelve a ejecutar `npm run build` en la terminal.
3. En el panel de Netlify de tu sitio, busca la pestaña **Deploys**.
4. Verás un cuadro que dice **"Need to update your site? Drag and drop your site folder here"**.
5. Arrastra de nuevo la carpeta `dist` actualizada a ese cuadro.

---

---

## Opción Pro: Despliegue Automático con GitHub
Esta es la mejor forma. Cada vez que cambies algo, la web se actualizará sola.

### 1. Inicializar Git en tu ordenador
Abre la terminal en la carpeta del proyecto y ejecuta estos comandos uno a uno:
```bash
git init
git add .
git commit -m "Primer despliegue profesional"
```

### 2. Subir a GitHub
1. Ve a [GitHub](https://github.com/new) y crea un repositorio nuevo (ej: `csif-asistente`).
2. Sigue las instrucciones de GitHub para "Push an existing repository", que serán algo así:
   ```bash
   git remote add origin https://github.com/tu-usuario/tu-repo.git
   git branch -M main
   git push -u origin main
   ```

### 3. Conectar GitHub con Netlify
1. En Netlify, en lugar de arrastrar la carpeta, dale a **"Add new site"** > **"Import an existing project"**.
2. Selecciona **GitHub** y busca tu repositorio.
3. En la configuración de construcción ("Build settings"), comprueba que coincida con esto:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. **MUY IMPORTANTE**: Ve a **Site configuration** > **Environment variables** y añade las claves allí:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GROQ_API_KEY` (Clave gratuita de Groq para que la IA no tenga límites)
5. ¡Listo! A partir de ahora, cualquier cambio que subas a GitHub actualizará tu web automáticamente.

---

## Cómo subir cambios nuevos (Día a día)
Una vez que ya has conectado todo, cada vez que quieras subir una mejora que hayamos hecho, solo tienes que ejecutar estos 3 comandos en la terminal:

1. **Preparar los archivos**:
   ```bash
   git add .
   ```
2. **Ponerle un nombre al cambio**:
   ```bash
   git commit -m "Explicación breve de lo que he cambiado"
   ```
3. **Subirlos a internet**:
   ```bash
   git push
   ```

¡Y Netlify detectará el cambio y actualizará tu web en un minuto!
