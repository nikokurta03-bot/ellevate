BEGIN;
CREATE TABLE "ScheduleDay" (
    "date" TIMESTAMP(3) NOT NULL PRIMARY KEY,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
ALTER TABLE "TrainingSlot" ALTER COLUMN "maxCapacity" SET DEFAULT 9;
UPDATE "TrainingSlot" SET "maxCapacity" = 9 WHERE "date" >= TIMESTAMP '2026-11-16 00:00:00';
-- Preserve every existing slot ID and reservation, adding 17:15 to scheduled days only.
INSERT INTO "TrainingSlot" ("date", "startTime", "endTime", "maxCapacity", "createdAt")
SELECT DISTINCT "date", '17:15', '18:15', 9, CURRENT_TIMESTAMP
FROM "TrainingSlot" WHERE "date" >= TIMESTAMP '2026-11-16 00:00:00'
ON CONFLICT ("date", "startTime") DO NOTHING;
COMMIT;
