-- CreateEnum
CREATE TYPE "GoalMembershipRole" AS ENUM ('EDITOR', 'MEMBER');

-- DropForeignKey
ALTER TABLE "GoalMembership" DROP CONSTRAINT "GoalMembership_goalId_fkey";

-- DropForeignKey
ALTER TABLE "GoalMembership" DROP CONSTRAINT "GoalMembership_userId_fkey";

-- AlterTable
ALTER TABLE "GoalMembership" ADD COLUMN     "role" "GoalMembershipRole" NOT NULL DEFAULT 'MEMBER';

-- AddForeignKey
ALTER TABLE "GoalMembership" ADD CONSTRAINT "GoalMembership_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalMembership" ADD CONSTRAINT "GoalMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
