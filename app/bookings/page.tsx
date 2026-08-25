import { headers } from "next/headers";
import Link from "next/link";

import { BookingsList } from "@/app/bookings/_components/bookings-list";
import { LoginToBook } from "@/app/bookings/_components/login-to-book";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  PageContainer,
  PageSectionContent,
  PageSectionTitle,
} from "@/components/ui/page";
import { getUserBookings } from "@/data/bookings";
import { auth } from "@/lib/auth";

export default async function BookingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
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
            {session?.user ? (
              <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
                <p className="mb-4 text-muted-foreground">
                  Você ainda não tem nenhum agendamento.
                </p>
                <Button asChild variant="default">
                  <Link href="/">Agendar agora</Link>
                </Button>
              </div>
            ) : (
              <LoginToBook />
            )}
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
