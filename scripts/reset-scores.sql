-- ============================================================
-- RESET SCORES - Copiar y pegar en Supabase SQL Editor
-- ============================================================

-- 1) NO TOCAR estos (hack intencional de penales):
--    Alemania 0-15 Paraguay
--    Países Bajos 0-14 Marruecos

-- 2) Resetear partidos que NO se jugaron todavía
UPDATE matches SET home_score = NULL, away_score = NULL, status = 'scheduled'
WHERE id = '88ffbfac-76ce-4df6-a4ad-b0b7286cd03b'; -- Belgium vs Senegal

UPDATE matches SET home_score = NULL, away_score = NULL, status = 'scheduled'
WHERE id = '0a2cb60b-e574-4c67-a296-e78bd35342f7'; -- Argentina vs Cape Verde

UPDATE matches SET home_score = NULL, away_score = NULL, status = 'scheduled'
WHERE id = '108a3b73-04dc-4c94-8a51-427aacf29735'; -- Colombia vs Ghana

-- 3) Resetear scores basura de otras rondas (el UUID mezcló todo)
UPDATE matches SET home_score = NULL, away_score = NULL, status = 'scheduled'
WHERE id = '14b0b1fa-804e-48a1-8f3d-dfb580fa4a8d'; -- Round of 16 Jul 4 (0-15 basura)

UPDATE matches SET home_score = NULL, away_score = NULL, status = 'scheduled'
WHERE id = '15c220ad-5e0d-41af-a84f-55d4cb3d35ad'; -- Round of 16 Jul 5 (0-14 basura)

UPDATE matches SET home_score = NULL, away_score = NULL, status = 'scheduled'
WHERE id = '1d20b7f8-3609-46c5-83a1-53f47846afdf'; -- Final (1-2 basura)

-- 4) Anular puntos SOLO de los partidos reseteados
UPDATE predictions SET points = NULL
WHERE match_id IN (
  '88ffbfac-76ce-4df6-a4ad-b0b7286cd03b',
  '0a2cb60b-e574-4c67-a296-e78bd35342f7',
  '108a3b73-04dc-4c94-8a51-427aacf29735',
  '14b0b1fa-804e-48a1-8f3d-dfb580fa4a8d',
  '15c220ad-5e0d-41af-a84f-55d4cb3d35ad',
  '1d20b7f8-3609-46c5-83a1-53f47846afdf'
);

-- 5) Verificar resultado final
SELECT match_date, match_time, round,
       (SELECT name FROM teams WHERE id = home_team_id) AS local,
       (SELECT name FROM teams WHERE id = away_team_id) AS visitante,
       home_score, away_score, status
FROM matches
WHERE knockout = true
ORDER BY match_date, match_time;
