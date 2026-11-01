CREATE TABLE "Membership" (
 "userId" INTEGER PRIMARY KEY, "joinedOn" TEXT NOT NULL, "firstPaidOn" TEXT NOT NULL,
 "lastPaidOn" TEXT NOT NULL, "dueOn" TEXT NOT NULL, "remindedFor" TEXT, "claimedAt" TIMESTAMP(3),
 CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Membership_dueOn_idx" ON "Membership"("dueOn");
