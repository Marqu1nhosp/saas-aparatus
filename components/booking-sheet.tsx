"use client";

import Image from "next/image";
import { useAction } from "next-safe-action/hooks";
import React, { useState } from "react";
import { toast } from "sonner";

import { createBooking } from "@/actions/create-booking";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface BookingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: {
    id: string;
    name: string;
    priceInCents?: number | null;
    imageUrl?: string | null;
  };
  barbershop: {
    id: string;
    name: string;
  };
}

// Static time slots from 09:00 to 17:00 with 30-minute intervals
const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
] as const;

export function BookingSheet({
  open,
  onOpenChange,
  service,
  barbershop,
}: BookingSheetProps) {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined
  );

  const { execute: executeCreateBooking, isPending } = useAction(createBooking);

  const handleDaySelect = (date: Date) => {
    setSelectedDay(date);
    // Clear selected time when day changes
    setSelectedTime(undefined);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDay || !selectedTime) return;

    // Create datetime from selected day and time
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const dateTime = new Date(selectedDay);
    dateTime.setHours(hours, minutes, 0, 0);

    executeCreateBooking({
      barbershopId: barbershop.id,
      serviceId: service.id,
      date: dateTime.toISOString(),
    });

    toast.success("Agendamento confirmado!");
    onOpenChange(false);
    setSelectedDay(undefined);
    setSelectedTime(undefined);
  };

  const price = service.priceInCents
    ? new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(service.priceInCents / 100)
    : "";

  const formattedDate = selectedDay
    ? selectedDay.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-6 p-5">
        <SheetHeader className="space-y-4">
          <SheetTitle>Reservar {service.name}</SheetTitle>
          <div className="text-xs text-muted-foreground">
            {barbershop.name}
          </div>
        </SheetHeader>

        {/* Calendar */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase">Data</h3>
          <Calendar selected={selectedDay} onSelect={handleDaySelect} />
        </div>

        {/* Time Slots */}
        {selectedDay && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase">Horário</h3>
            <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2">
              {TIME_SLOTS.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeSelect(time)}
                  className="shrink-0"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Booking Summary Card */}
        {selectedDay && selectedTime && (
          <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/50 p-4">
            <div className="space-y-3">
              {/* Service Info */}
              <div className="flex gap-3">
                <div className="relative shrink-0 w-12 h-12 rounded-md bg-background overflow-hidden">
                  {service.imageUrl ? (
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      fill
                      className="object-cover"
                      sizes="3rem"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-muted">
                      <span className="text-xs font-semibold">-</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {barbershop.name}
                  </p>
                </div>
              </div>

              {/* Date and Time */}
              <div className="space-y-1 border-t border-border pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">{formattedDate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Horário:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
                <span>Total:</span>
                <span>{price}</span>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Button */}
        <Button
          onClick={handleConfirmBooking}
          disabled={!selectedDay || !selectedTime || isPending}
          className="w-full mt-auto"
        >
          {isPending ? "Confirmando..." : "Confirmar agendamento"}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
