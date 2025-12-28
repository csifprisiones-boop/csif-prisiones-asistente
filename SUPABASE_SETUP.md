# Integración de Supabase

Se ha integrado Supabase en el proyecto **csif-prisiones-assistant**.

## Configuración
- **Proyecto**: csifprisiones-asistente
- **URL**: https://vozghpaojmlengknmlgi.supabase.co
- **Variables de Entorno**: Configuradas en `.env.local`

## Base de Datos
Se han creado las siguientes tablas para el registro de actividad:

### `access_logs`
Registra los accesos de los usuarios (login y aperturas de la app).
- `id`: UUID (Primary Key)
- `user_id`: UUID (Referencia a auth.users)
- `action`: Texto (ej. 'login', 'login_or_app_open')
- `created_at`: Fecha y hora

### `user_interactions`
Registra las interacciones de los usuarios dentro de la app.
- `id`: UUID (Primary Key)
- `user_id`: UUID (Referencia a auth.users)
- `interaction_type`: Texto (ej. 'navigation')
- `details`: JSONB (ej. `{ "path": "/chat" }`)
- `created_at`: Fecha y hora

## Componentes Implementados
1.  **AuthProvider** (`components/AuthProvider.tsx`): Gestiona la sesión del usuario y registra automáticamente el acceso.
2.  **LoginScreen** (`screens/LoginScreen.tsx`): Pantalla de inicio de sesión y registro.
3.  **Tracking Service** (`services/tracking.ts`): Servicio para registrar interacciones personalizadas.
4.  **RouteTracker** (`App.tsx`): Componente que registra automáticamente la navegación entre pantallas.

## Uso
La aplicación ahora está protegida. Al iniciar, si el usuario no está autenticado, se mostrará la pantalla de Login.
El registro de navegación es automático. Para registrar interacciones adicionales (ej. clics en botones específicos), usa:

```typescript
import { logInteraction } from './services/tracking';

// Ejemplo
<button onClick={() => logInteraction('boton_click', { id: 'mi_boton' })}>
  Click me
</button>
```
