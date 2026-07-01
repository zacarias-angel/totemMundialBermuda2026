-- ============================================================
-- FIX ORPHAN PREDICTIONS - Correr en Supabase SQL Editor
-- ============================================================

-- 1) Ver predicciones con partidos que no existen (fantasmas reales)
SELECT p.id AS pred_id, p.user_id, p.match_id, p.home_score, p.away_score, p.points
FROM predictions p
LEFT JOIN matches m ON m.id = p.match_id
WHERE m.id IS NULL;

-- 2) Borrar las que son realmente huérfanas
DELETE FROM predictions
WHERE match_id NOT IN (SELECT id FROM matches);

-- 3) Ver predicciones con partidos existentes pero sin equipos (los "?")
SELECT p.id, m.round, m.match_date, m.match_time,
       p.home_score AS pred_home, p.away_score AS pred_away,
       ht.name AS home_team, at.name AS away_team,
       m.home_score, m.away_score
FROM predictions p
JOIN matches m ON m.id = p.match_id
LEFT JOIN teams ht ON ht.id = m.home_team_id
LEFT JOIN teams at ON at.id = m.away_team_id
WHERE m.knockout = true
  AND (m.home_team_id IS NULL OR m.away_team_id IS NULL);

-- 4) Asignar equipos a los Round of 32 según fixture.json
--    (ajustá fecha/hora si no coinciden con tu fixture actual)
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'South Africa'), away_team_id = (SELECT id FROM teams WHERE name = 'Canada')       WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-06-28' AND match_time = '16:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'Brazil'),       away_team_id = (SELECT id FROM teams WHERE name = 'Japan')       WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-06-29' AND match_time = '14:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'Germany'),      away_team_id = (SELECT id FROM teams WHERE name = 'Paraguay')    WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-06-29' AND match_time = '17:30';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'Netherlands'),  away_team_id = (SELECT id FROM teams WHERE name = 'Morocco')    WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-06-29' AND match_time = '22:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'Ivory Coast'),  away_team_id = (SELECT id FROM teams WHERE name = 'Norway')     WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-06-30' AND match_time = '14:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'France'),       away_team_id = (SELECT id FROM teams WHERE name = 'Sweden')     WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-06-30' AND match_time = '18:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'Mexico'),       away_team_id = (SELECT id FROM teams WHERE name = 'Ecuador')    WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-06-30' AND match_time = '22:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'England'),      away_team_id = (SELECT id FROM teams WHERE name = 'DR Congo')   WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-07-01' AND match_time = '13:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'Belgium'),      away_team_id = (SELECT id FROM teams WHERE name = 'Senegal')    WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-07-01' AND match_time = '17:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'United States'),away_team_id = (SELECT id FROM teams WHERE name = 'Bosnia and Herzegovina') WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-07-01' AND match_time = '21:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'Spain'),        away_team_id = (SELECT id FROM teams WHERE name = 'Austria')    WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-07-02' AND match_time = '16:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'Portugal'),     away_team_id = (SELECT id FROM teams WHERE name = 'Croatia')    WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-07-02' AND match_time = '20:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'Switzerland'),  away_team_id = (SELECT id FROM teams WHERE name = 'Algeria')    WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-07-03' AND match_time = '00:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'Australia'),    away_team_id = (SELECT id FROM teams WHERE name = 'Egypt')      WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-07-03' AND match_time = '15:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'Argentina'),    away_team_id = (SELECT id FROM teams WHERE name = 'Cape Verde') WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-07-03' AND match_time = '19:00';
UPDATE matches SET home_team_id = (SELECT id FROM teams WHERE name = 'Colombia'),     away_team_id = (SELECT id FROM teams WHERE name = 'Ghana')      WHERE knockout = true AND round = 'Round of 32' AND match_date = '2026-07-03' AND match_time = '22:30';

-- 5) Verificar que todos los Round of 32 ya tengan equipos
SELECT id, round, match_date, match_time,
       (SELECT name FROM teams WHERE id = home_team_id) AS local,
       (SELECT name FROM teams WHERE id = away_team_id) AS visitante
FROM matches
WHERE knockout = true AND round = 'Round of 32'
ORDER BY match_date, match_time;
