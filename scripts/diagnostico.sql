-- ============================================================
-- DIAGNÓSTICO: Knockout matches - Correr en Supabase SQL Editor
-- ============================================================

-- 1) Ver TODOS los knockout ordenados por fecha
SELECT id, round, match_date, match_time,
       (SELECT name FROM teams WHERE id = home_team_id) AS local,
       (SELECT name FROM teams WHERE id = away_team_id) AS visitante,
       home_score, away_score, status
FROM matches
WHERE knockout = true
ORDER BY match_date, match_time;

-- 2) Ver duplicados (misma fecha+hora+round)
SELECT match_date, match_time, round, COUNT(*) AS duplicados
FROM matches
WHERE knockout = true
GROUP BY match_date, match_time, round
HAVING COUNT(*) > 1;

-- 3) Ver partidos knockout sin equipos
SELECT id, round, match_date, match_time, status
FROM matches
WHERE knockout = true
  AND (home_team_id IS NULL OR away_team_id IS NULL)
ORDER BY match_date, match_time;

-- 4) Contar total de matches en la DB
SELECT knockout, COUNT(*) FROM matches GROUP BY knockout;
