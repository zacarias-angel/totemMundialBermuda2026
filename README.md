# Prode Mundial 2026

App web para pronosticar resultados del Mundial 2026.

Tres módulos en una misma app: **Tótem** (pantalla vertical 43"), **Mobile** (celular), **Admin** (gestión).

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 App Router |
| Frontend | React 19, TypeScript, TailwindCSS 4 |
| Backend | Supabase (PostgreSQL + REST + Realtime) |
| Hosting | Vercel |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── totem/          # Módulo Tótem — pantalla vertical
│   ├── mobile/         # Módulo Mobile — pronósticos desde el celular
│   └── admin/          # Módulo Admin — gestión de datos
├── components/
│   ├── ui/             # Componentes reutilizables (Button, Card, Input, QRCode, MatchCard)
│   ├── totem/          # Componentes específicos del tótem
│   ├── mobile/         # Componentes específicos del mobile
│   └── admin/          # Componentes específicos del admin
├── lib/
│   ├── supabase/       # Clientes Supabase (browser, server, users)
│   ├── types/          # Tipos TypeScript compartidos
│   └── utils/          # Utilidades (cálculo de puntajes)
├── services/           # Lógica de negocio (fixture, predictions, ranking, viernes)
data/                   # JSON del fixture (seed)
scripts/                # Script para importar fixture a Supabase
supabase/migrations/    # SQL para crear tablas y políticas RLS
```

---

## Rutas

### Tótem (`/totem`)

| Ruta | Función |
|---|---|
| `/totem` | Splash con video. Al tocar → navega a `/totem/home` |
| `/totem/home` | Ranking + QR para escanear + botón "Hacé tus pronósticos" |
| `/totem/viernes` | Resultados de Viernes de Qué en vivo |
| `/totem/fotofigurita` | Selfie + generación AI de figurita Panini (OpenAI) |
| `/totem/galeria` | Galería de fotofiguritas generadas |

### Mobile (`/mobile`)

| Ruta | Función |
|---|---|
| `/mobile` | Login (nombre + email) |
| `/mobile/pronosticos` | Pronosticar partidos por grupo |
| `/mobile/mis-pronosticos` | Historial de pronósticos con puntajes |
| `/mobile/ranking` | Ranking de participantes |
| `/mobile/viernes` | Responder la pregunta de Viernes de Qué |

### Admin (`/admin`)

| Ruta | Función |
|---|---|
| `/admin` | Dashboard con estadísticas |
| `/admin/usuarios` | Lista de usuarios registrados |
| `/admin/resultados` | Cargar resultados de partidos |
| `/admin/eliminatorias` | Asignar equipos a eliminatorias |
| `/admin/viernes` | Crear/activar/eliminar preguntas |

---

## Flujo de datos

### Login
1. Usuario ingresa nombre + email en `/mobile`
2. Se busca el email en la tabla `users` de Supabase
3. Si existe → se loguea. Si no → se crea un registro nuevo
4. Se guarda `{ id, name, email }` en `localStorage` y en una cookie (`prode_user_id`)
5. Las Server Components leen la cookie para identificar al usuario

### Pronósticos
1. El fixture se carga desde `data/fixture.json` mediante `npm run seed`
2. En `/mobile/pronosticos` se muestran los partidos agrupados
3. El usuario elige resultados (goles de local y visitante)
4. Se guarda en `predictions` con `user_id` + `match_id` + `home_score` + `away_score`
5. Cuando el admin carga un resultado y marca "Finalizado", se recalcula automáticamente:
   - 3 puntos = resultado exacto
   - 1 punto = acierto de ganador o empate
   - 0 puntos = incorrecto

### Ranking
- Se calcula leyendo todas las `predictions` con `points` no nulos
- Se agrupa por usuario, se suman puntos, se ordena descendente

### Viernes de Qué
1. Admin crea una pregunta en `/admin/viernes` y la activa
2. En `/mobile/viernes` los usuarios ven la pregunta activa y responden
3. En `/totem/viernes` se muestran los resultados con barras proporcionales

---

## Base de datos (Supabase)

### Tablas

| Tabla | Descripción |
|---|---|
| `groups` | Grupos (A, B, C, ..., L) |
| `teams` | Equipos, vinculados a un grupo |
| `matches` | Partidos (fase de grupos + eliminatorias) |
| `users` | Usuarios (solo nombre + email) |
| `predictions` | Pronósticos de cada usuario por partido |
| `viernes_questions` | Preguntas de Viernes de Qué |
| `viernes_answers` | Respuestas de usuarios a las preguntas |

### Políticas RLS
Todas las tablas tienen RLS habilitado con políticas abiertas para `anon`:
- **SELECT**: todas las tablas (lectura pública)
- **INSERT**: `users`, `predictions`, `viernes_questions`, `viernes_answers`
- **UPDATE**: `matches`, `predictions`, `viernes_questions`, `viernes_answers`
- **DELETE**: `viernes_questions`

> ⚠ Como el login es nombre+email sin Supabase Auth, las políticas son abiertas. Si se migra a Supabase Auth en el futuro, restringir con `auth.uid()`.

---

## Puntuación

| Resultado | Puntos |
|---|---|
| Resultado exacto | 3 |
| Acierto de ganador/empate | 1 |
| Incorrecto | 0 |

Cálculo en `src/lib/utils/scoring.ts`.

---

## Eliminatorias

Un partido eliminatorio se habilita para pronósticos solo cuando:
- `home_team_id IS NOT NULL`
- `away_team_id IS NOT NULL`

Se cargan desde el fixture con equipos vacíos. El admin los asigna desde `/admin/eliminatorias`.

---

## Troubleshooting

### Error: `Could not find the 'away_team_id' column of 'matches'`
**Causa**: La tabla `matches` existe pero sin las columnas necesarias.
**Solución**: Dropear la tabla y recrear con el migration completo.

### Error: `401 Unauthorized` en la consola
**Causa**: Falta política RLS para la operación.
**Solución**: Ejecutar `supabase/migrations/00002_rls.sql` en el SQL Editor.

### Error: `Missing SUPABASE env vars` al hacer seed
**Causa**: `tsx` no carga `.env.local` automáticamente.
**Solución**: El script `scripts/seed.ts` ya carga el archivo manualmente. Verificar que `.env.local` existe.

### No se ven partidos en `/mobile/pronosticos`
**Causa**: No se ejecutó el seed o falló.
**Solución**: Verificar en Supabase Table Editor que `matches` tenga datos. Si no, ejecutar `npm run seed`.

### Error al enviar respuesta de Viernes de Qué
**Causa**: La constraint `UNIQUE(user_id, question_id)` no existe o hay conflicto.
**Solución**: Verificar que la migración 00001 se ejecutó correctamente y que la tabla `viernes_answers` tiene la constraint única.

---

## Seed (importar fixture)

```bash
npm run seed
```

Requiere `.env.local` con:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=sk-xxx
```

---

## Fotofigurita (generación AI)

El tótem captura una selfie sin máscara y la envía al servidor junto con el template de figurita (`public/asset/figurita-template.png`). La API `POST /api/fotofigurita/generate` usa OpenAI `gpt-image-2` (`images.edit`) para generar una figurita estilo Panini con la cara del usuario en estilo caricaturesco.

**Requisitos:**
- `OPENAI_API_KEY` en `.env.local` (solo servidor, nunca expuesta al cliente)
- Verificación de organización en [OpenAI developer console](https://platform.openai.com) para modelos `gpt-image-*`
- Timeout de API route: **120 segundos** (`maxDuration`). El hosting debe soportar requests largos (Vercel Hobby tiene ~10s; Pro permite configurar hasta 120s+)

**Costo estimado:** ~USD 0.05 por figurita con `quality: medium`. Rate limit: 3 requests/min por IP.

**Flujo:** cámara → selfie → OpenAI → preview → descarga/compartir → galería (Supabase Storage)

---

## Desarrollo

```bash
npm run dev
```

Si accedés desde otro dispositivo en la misma red, Next.js puede bloquear recursos. Agregar la IP en `next.config.ts`:

```ts
allowedDevOrigins: ['192.168.x.x']
```
