-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_eventId_fkey";

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
