-- Datum zadnjeg plaćanja članarine. Nullable da postojeće članice ostanu valjane dok admin ne unese datum.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "membershipPaidOn" TIMESTAMP(3);
