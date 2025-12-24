"use client";

import { AvatarImage } from "@radix-ui/react-avatar";

import { getBookingStatus } from "@/lib/booking-utils";

import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface BookingItemProps {
    bookingId: string;
    serviceName: string;
    barbershopName: string;
    barbershopImageUrl: string;
    date: Date | string;
    cancelledAt: Date | string | null;
    onClick?: () => void;
}

export function BookingItem({
    serviceName,
    barbershopName,
    barbershopImageUrl,
    date,
    cancelledAt,
    onClick,
}: BookingItemProps) {
    const { isCancelled, isFinished } = getBookingStatus(
        date,
        cancelledAt,
    );

    const badgeVariant = isCancelled
        ? "destructive"
        : isFinished
            ? "secondary"
            : "default";

    const statusLabel = isCancelled
        ? "Cancelado"
        : isFinished
            ? "Finalizado"
            : "Confirmado";

    const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
    ];

    const bookingDateObj =
        date instanceof Date ? date : new Date(date);

    const isValidDate = !isNaN(bookingDateObj.getTime());

    const month = isValidDate ? monthNames[bookingDateObj.getMonth()] : "";
    const day = isValidDate ? bookingDateObj.getDate() : 0;
    const hours = isValidDate
        ? bookingDateObj.getHours().toString().padStart(2, "0")
        : "00";
    const minutes = isValidDate
        ? bookingDateObj.getMinutes().toString().padStart(2, "0")
        : "00";
    const time = `${hours}:${minutes}`;

    return (
        <Card
            className="flex h-full w-full cursor-pointer flex-row items-center justify-between p-0 mt-4"
            onClick={onClick}
        >
            <div className="flex flex-1 flex-col gap-4 p-4">
                <Badge variant={badgeVariant}>{statusLabel}</Badge>
                <div className="flex flex-col gap-2">
                    <p className="font-bold">{serviceName}</p>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={barbershopImageUrl} />
                        </Avatar>
                        <p className="text-sm font-medium">{barbershopName}</p>
                    </div>
                </div>
            </div>

            <div className="flex h-full flex-col items-center justify-center border-l py-3 w-26.5">
                <p className="text-xs capitalize">{month}</p>
                <p className="text-2xl">{day.toString()}</p>
                <p className="text-xs">{time}</p>
            </div>
        </Card>
    );
}