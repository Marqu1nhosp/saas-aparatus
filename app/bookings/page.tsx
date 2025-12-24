import Link from "next/link";

import { BookingsList } from "@/app/bookings/_components/bookings-list";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  PageContainer,
  PageSectionContent,
  PageSectionTitle,
} from "@/components/ui/page";
import { getUserBookings } from "@/data/bookings";

export default async function BookingsPage() {
  const bookings = await getUserBookings();

  const now = new Date();
  const confirmedBookings = bookings.filter(
    (booking) => !booking.cancelledAt && new Date(booking.date) >= now,
  );
  const finishedBookings = bookings.filter(
    (booking) =>
      booking.cancelledAt !== null || new Date(booking.date) < now,
  );

  return (
    <div>
      <Header />
      <PageContainer>
        {bookings.length === 0 ? (
          <PageSectionContent>
            <PageSectionTitle>Meus Agendamentos</PageSectionTitle>
            <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Você ainda não tem nenhum agendamento.
              </p>
              <Button asChild variant="default">
                <Link href="/">Agendar agora</Link>
              </Button>
            </div>
          </PageSectionContent>
        ) : (
          <>
            {confirmedBookings.length > 0 && (
              <PageSectionContent>
                <PageSectionTitle>Confirmados</PageSectionTitle>
                <BookingsList bookings={confirmedBookings} />
              </PageSectionContent>
            )}

            {finishedBookings.length > 0 && (
              <PageSectionContent>
                <PageSectionTitle>Finalizados</PageSectionTitle>
                <BookingsList bookings={finishedBookings} />
              </PageSectionContent>
            )}
          </>
        )}
      </PageContainer>
    </div>
  );
}
