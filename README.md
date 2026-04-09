# DayPilot API

API de agenda inteligente construida con NestJS, PostgreSQL, Prisma, BullMQ y JWT.

## Stack Tecnológico

| Tecnología | Propósito |
|------------|-----------|
| **Node.js** | Runtime |
| **NestJS** | Framework |
| **TypeScript** | Lenguaje |
| **PostgreSQL** | Base de datos |
| **Prisma** | ORM |
| **BullMQ + Redis** | Colas de recordatorios |
| **JWT** | Autenticación |

---

## ¿Qué hace?

DayPilot es una API de agenda personal inteligente que permite:

### 1. Gestión de Eventos
- Crear, leer, actualizar y eliminar eventos
- Filtrar eventos por fecha, rango de fechas y prioridad
- Endpoint especiales: `GET /events/today` y `GET /events/important`
- Marcar eventos como completados
- Reprogramar eventos

### 2. Recordatorios Automáticos
- Programar recordatorios X minutos antes de un evento
- El worker de BullMQ ejecuta los recordatorios a la hora exacta
- Soporta múltiples recordatorios por evento

### 3. Notas por Evento
- Agregar notas contextuales a cada evento
- Las notas se eliminan automáticamente si se elimina el evento

### 4. Autenticación JWT
- Registro de usuarios
- Login con JWT
- Endpoints protegidos

### 5. Interpretación de Lenguaje Natural
- Endpoint `/ai/interpret` que parses texto en lenguaje natural
- Detecta intención: crear evento, actualizar, eliminar, consultar
- Extrae datos: título, fecha/hora, prioridad

---

## Estructura del Proyecto

```
agenda-api/
├── src/
│   ├── app.module.ts              # Módulo raíz
│   ├── main.ts                    # Entry point
│   ├── database/
│   │   └── prisma.service.ts      # Cliente Prisma
│   ├── modules/
│   │   ├── events/
│   │   │   ├── events.controller.ts
│   │   │   ├── events.service.ts
│   │   │   ├── events.module.ts
│   │   │   └── dto/event.dto.ts
│   │   ├── reminders/
│   │   │   ├── reminders.controller.ts
│   │   │   ├── reminders.service.ts
│   │   │   └── dto/reminder.dto.ts
│   │   ├── notes/
│   │   │   ├── notes.controller.ts
│   │   │   ├── notes.service.ts
│   │   │   └── dto/note.dto.ts
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── dto/auth.dto.ts
│   │   └── ai/
│   │       ├── ai.controller.ts
│   │       ├── ai.service.ts
│   │       └── dto/ai.dto.ts
│   └── jobs/
│       └── reminder.processor.ts  # Worker de BullMQ
├── prisma/
│   └── schema.prisma              # Modelo de datos
├── .env                           # Variables de entorno
└── package.json
```

---

## Modelo de Datos

### User
- id, email (unique), password, name, createdAt, updatedAt

### Event
- id, title, description, startDate, endDate, location
- priority (high/medium/low), status (pending/completed/cancelled)
- createdAt, updatedAt, userId (relación opcional)

### Reminder
- id, eventId, minutesBefore, sent, createdAt

### Note
- id, eventId, content, createdAt

---

## Endpoints

### Eventos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/events` | Crear evento |
| GET | `/events` | Listar eventos (`?date=`, `?from=`, `?to=`, `?priority=`) |
| GET | `/events/today` | Eventos de hoy |
| GET | `/events/important` | Eventos importantes (high priority o próximos) |
| GET | `/events/:id` | Obtener evento específico |
| PATCH | `/events/:id` | Actualizar evento |
| PATCH | `/events/:id/complete` | Marcar como completado |
| PATCH | `/events/:id/reschedule` | Reprogramar (`{ "startDate": "..." }`) |
| DELETE | `/events/:id` | Eliminar evento |

### Recordatorios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/events/:eventId/reminders` | Crear recordatorio |
| GET | `/events/:eventId/reminders` | Listar recordatorios |
| DELETE | `/events/:eventId/reminders/:id` | Eliminar recordatorio |

### Notas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/events/:eventId/notes` | Crear nota |
| GET | `/events/:eventId/notes` | Listar notas |
| PATCH | `/events/:eventId/notes/:id` | Actualizar nota |
| DELETE | `/events/:eventId/notes/:id` | Eliminar nota |

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registro (`{ "email", "password", "name?" }`) |
| POST | `/auth/login` | Login (`{ "email", "password" }`) |
| GET | `/auth/profile` | Perfil (requiere JWT) |

### Inteligencia Artificial

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/ai/interpret` | Interpretar texto |

Ejemplo:
```json
// Request
{ "input": "Reunión mañana a las 3pm con Juan" }

// Response
{
  "action": "create_event",
  "data": {
    "title": "Reunión mañana a las 3pm con Juan",
    "startDate": "2026-04-10T15:00:00.000Z",
    "priority": "medium"
  }
}
```

---

## Cómo Ejecutar

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/daypilot"
JWT_SECRET="daypilot-secret-key-change-in-production"
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
```

### 3. Crear base de datos
```bash
# PostgreSQL debe estar corriendo
createdb daypilot
```

### 4. Generar cliente Prisma y migrar
```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Iniciar Redis (para recordatorios)
```bash
# Docker
docker run -d -p 6379:6379 redis

# O instalar Redis localmente
```

### 6. Ejecutar la API
```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

### 7. Verificar
```bash
curl http://localhost:3000/events
```

---

## Limitaciones y Consideraciones

### Funcionalidades No Implementadas (MVP)
- ❌ Eventos recurrentes (RRULE)
- ❌ Sincronización con Google Calendar / Outlook
- ❌ Notificaciones push (email, WhatsApp, SMS)
- ❌ Invitados a eventos
- ❌ Adjuntos archivos
- ❌ Zonas horarias avanzadas (todo se guarda en UTC)
- ❌ Rate limiting
- ❌ Webhooks para notificaciones

### Limitaciones del Sistema de Recordatorios
- ⚠️ Si se modifica la fecha de un evento, el recordatorio debe reprogramarse manualmente
- ⚠️ Si se elimina un evento, los recordatorios asociados se eliminan (CASCADE)
- ⚠️ No hay soporte para zonas horarias - todo se procesa en UTC
- ⚠️ Redis debe estar corriendo o los recordatorios no funcionarán

### Limitaciones del Parser de IA
- ⚠️ Es un parser básico por regex, NO usa IA real
- ⚠️ Solo reconoce palabras clave básicas (hoy, mañana, urgente, etc.)
- ⚠️ No extrae nombres de personas correctamente
- ⚠️ No maneja fechas complejas (próximo viernes, en 2 semanas)

### Seguridad
- ⚠️ JWT secret en .env debería cambiarse en producción
- ⚠️ No hay validación de email real
- ⚠️ No hay rate limiting
- ⚠️ Password no tiene requisitos mínimos

### Base de Datos
- ⚠️ No hay índices adicionales más allá de las foreign keys
- ⚠️ No hay soft deletes
- ⚠️ No hay migraciones para producción (solo dev)

### Rendimiento
- ⚠️ No hay pagination en listados
- ⚠️ No hay caching
- ⚠️ Consultas sin optimización para grandes volúmenes

---

## Decisiones de Diseño

1. **Fechas en UTC**: Todas las fechas se almacenan en UTC. El frontend debe manejar la conversión a hora local.

2. **Priority como Enum**: Se usa `high`, `medium`, `low` (no string libre) para que la IA pueda consultar de forma predecible.

3. **Status como Enum**: `pending`, `completed`, `cancelled` para control de flujo.

4. **Reminders con BullMQ**: Se usa BullMQ + Redis para persistencia de jobs. Si el servidor se reinicia, los recordatorios programado se mantienen.

5. **IA como Parser Básico**: Se implementó un parser por regex para poder iterary mejorarlo después con OpenAI u otro modelo.

---

## Siguientes Pasos Recomendados

### Nivel 2 (Próximas funcionalidades)
- Parser de lenguaje natural más robusto 
- Prioridad automática basada en contexto
- Eventos recurrentes

### Nivel 3 (Integraciones)
- Integración con WhatsApp (Twilio)
- Notificaciones push (FCM)
- UI web/mobile

### Nivel 4 (IA Avanzada)
- Agenda inteligente que sugiere horarios
- Resumen automático de eventos del día
- Auto-planificación

---

## API de Ejemplo (curl)

```bash
# Registrar usuario
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Isaac"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Crear evento (con JWT)
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Reunión con equipo",
    "startDate": "2026-04-10T15:00:00",
    "endDate": "2026-04-10T16:00:00",
    "priority": "high",
    "location": "Zoom"
  }'

# Listar eventos de hoy
curl http://localhost:3000/events/today

# Crear recordatorio (30 min antes)
curl -X POST http://localhost:3000/events/<EVENT_ID>/reminders \
  -H "Content-Type: application/json" \
  -d '{"minutesBefore": 30}'

# Interpretar lenguaje natural
curl -X POST http://localhost:3000/ai/interpret \
  -H "Content-Type: application/json" \
  -d '{"input": "Recordar reunión mañana a las 3pm"}'
```

---
