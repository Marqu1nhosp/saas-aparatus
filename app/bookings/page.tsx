"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  PageContainer,
  PageSectionContent,
  PageSectionTitle,
} from "@/components/ui/page";

interface Booking {
  id: string;
  date: string;
  barbershop: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
    imageUrl: string;
    priceInCents: number;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings");
        if (!response.ok) {
          throw new Error("Falha ao carregar agendamentos");
        }
        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar seus agendamentos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceInCents / 100);
  };

  return (
    <div>
      <Header />
      <PageContainer>
        <PageSectionContent>
          <PageSectionTitle>Meus Agendamentos</PageSectionTitle>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregando agendamentos...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Você ainda não tem nenhum agendamento.
              </p>
              <Button asChild variant="default">

                <Link href="/">Agendar agora</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex gap-4">
                    {/* Service Image */}
                    <div className="relative shrink-0 w-16 h-16 rounded-md bg-muted overflow-hidden">
                      {booking.service.imageUrl ? (
                        <Image
                          src={booking.service.imageUrl}
                          alt={booking.service.name}
                          fill
                          className="object-cover"
                          sizes="4rem"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="text-xs font-semibold">-</span>
                        </div>
                      )}
                    </div>

                    {/* Booking Info */}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold">
                        {booking.service.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {booking.barbershop.name}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(booking.date)}
                        </p>
                        <p className="text-sm font-semibold">
                          {formatPrice(booking.service.priceInCents)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageSectionContent>
      </PageContainer>
    </div>
  );
}
