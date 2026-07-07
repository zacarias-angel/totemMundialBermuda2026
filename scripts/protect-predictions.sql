-- TRIGGER: bloquea predicciones para partidos ya jugados o no programados
-- Ejecutar este SQL en el SQL Editor de Supabase (https://supabase.com/dashboard)
-- Protege contra llamadas directas desde PowerShell, curl, etc.

CREATE OR REPLACE FUNCTION check_prediction_valid()
RETURNS TRIGGER AS $$
DECLARE
  match_record RECORD;
  match_timestamp TIMESTAMPTZ;
BEGIN
  SELECT status, match_date, match_time INTO match_record
  FROM matches
  WHERE id = NEW.match_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El partido no existe';
  END IF;

  IF match_record.status != 'scheduled' THEN
    RAISE EXCEPTION 'No se puede pronosticar: el partido no está programado (status=%)', match_record.status;
  END IF;

  IF match_record.match_date IS NOT NULL AND match_record.match_time IS NOT NULL THEN
    match_timestamp := (match_record.match_date || ' ' || match_record.match_time || ':00')::TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires';

    IF NOW() > match_timestamp THEN
      RAISE EXCEPTION 'No se puede pronosticar: el partido ya comenzó (%)', match_timestamp;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_check_prediction_valid ON predictions;

CREATE TRIGGER trigger_check_prediction_valid
BEFORE INSERT OR UPDATE ON predictions
FOR EACH ROW
EXECUTE FUNCTION check_prediction_valid();
