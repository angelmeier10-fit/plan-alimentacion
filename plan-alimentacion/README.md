# plan-alimentacion

App de plan de alimentación (React + Vite + Firestore) para Ángel y Gabriela.

## Setup inicial

1. Instalar dependencias:
   ```
   npm install
   ```

2. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/) con Firestore habilitado, y copiar `.env.example` a `.env.local` completando las 6 variables `VITE_FIREBASE_*` con las credenciales del proyecto (Configuración del proyecto -> Configuración general -> tus apps).

3. Cargar los datos iniciales (una sola vez). El script usa el Admin SDK, así que necesita una cuenta de servicio:
   - Firebase Console -> Configuración del proyecto -> Cuentas de servicio -> "Generar nueva clave privada" (descarga un `.json`, no commitear).
   - Correr:
     ```
     GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/service-account.json node scripts/seed.js
     ```
     (en PowerShell: `$env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\service-account.json"; node scripts/seed.js`)

4. Desplegar las reglas de Firestore:
   ```
   firebase deploy --only firestore:rules
   ```

5. Desarrollo local:
   ```
   npm run dev
   ```

## Deploy (GitHub Pages)

1. Crear el repo en GitHub.
2. Setear los 6 secrets `VITE_FIREBASE_*` con `gh secret set`, por ejemplo:
   ```
   gh secret set VITE_FIREBASE_API_KEY
   ```
3. Hacer push a `main`.
4. En la configuración del repo, habilitar GitHub Pages con source "GitHub Actions" (solo la primera vez).
