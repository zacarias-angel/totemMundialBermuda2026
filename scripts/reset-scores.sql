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

-- ============================================================
-- FE DE ERRATAS: 3 pts para todos, 1 pt solo para estos dos
-- ============================================================

-- Ivory Coast 2-1 Norway
UPDATE predictions SET points = 3
WHERE match_id = '8fd96e4a-8bd6-4730-93a6-12d52f1a6170'
AND user_id NOT IN ('2240df1b-9884-4327-9bc7-5831a2571470', '051eb3b7-4984-4cd3-8629-d85c9a16af62');

UPDATE predictions SET points = 1
WHERE match_id = '8fd96e4a-8bd6-4730-93a6-12d52f1a6170'
AND user_id IN ('2240df1b-9884-4327-9bc7-5831a2571470', '051eb3b7-4984-4cd3-8629-d85c9a16af62');

-- Mexico 2-0 Ecuador
UPDATE predictions SET points = 3
WHERE match_id = 'e58d19e4-a57f-4c3c-8ede-3bfdd947256e'
AND user_id NOT IN ('2240df1b-9884-4327-9bc7-5831a2571470', '051eb3b7-4984-4cd3-8629-d85c9a16af62');

UPDATE predictions SET points = 1
WHERE match_id = 'e58d19e4-a57f-4c3c-8ede-3bfdd947256e'
AND user_id IN ('2240df1b-9884-4327-9bc7-5831a2571470', '051eb3b7-4984-4cd3-8629-d85c9a16af62');

-- England 2-1 DR Congo
UPDATE predictions SET points = 3
WHERE match_id = 'd189aaa2-67cc-4b4b-a711-93f0bd84650f'
AND user_id NOT IN ('2240df1b-9884-4327-9bc7-5831a2571470', '051eb3b7-4984-4cd3-8629-d85c9a16af62');

UPDATE predictions SET points = 1
WHERE match_id = 'd189aaa2-67cc-4b4b-a711-93f0bd84650f'
AND user_id IN ('2240df1b-9884-4327-9bc7-5831a2571470', '051eb3b7-4984-4cd3-8629-d85c9a16af62');

-- 5) Verificar resultado final
SELECT match_date, match_time, round,
       (SELECT name FROM teams WHERE id = home_team_id) AS local,
       (SELECT name FROM teams WHERE id = away_team_id) AS visitante,
       home_score, away_score, status
FROM matches
WHERE knockout = true
ORDER BY match_date, match_time;
