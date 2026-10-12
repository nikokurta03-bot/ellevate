-- Shift upcoming 19:15 sessions without changing slot IDs or reservations.
UPDATE "TrainingSlot"
SET "startTime" = '19:20', "endTime" = '20:20'
WHERE "startTime" = '19:15'
  AND ("date"::date + "startTime"::time) > (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Zagreb');
