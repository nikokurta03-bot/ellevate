CREATE TABLE "NutritionMenu" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "plan" TEXT NOT NULL,
    "days" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NutritionMenu_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NutritionMenu_userId_plan_key" ON "NutritionMenu"("userId", "plan");

ALTER TABLE "NutritionMenu" ADD CONSTRAINT "NutritionMenu_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
