"use server"
import { z } from "zod";

import { getBusinessHours } from "@/data/dashboard";
import { actionClient } from "@/lib/action-client";
import prisma from "@/lib/prisma";

const inputSchema = z.object({
    barbershopId: z.string().uuid(),
    serviceId: z.string().uuid(),
    date: z.date(),
});

const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo";

function getDatePartsInSaoPaulo(date: Date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: SAO_PAULO_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const year = parts.find((part) => part.type === "year")?.value ?? "0000";
    const month = parts.find((part) => part.type === "month")?.value ?? "01";
    const day = parts.find((part) => part.type === "day")?.value ?? "01";

    return { year, month, day, ymd: `${year}-${month}-${day}` };
}

function getDayOfWeekInSaoPaulo(date: Date): number {
    const shortWeekDay = new Intl.DateTimeFormat("en-US", {
        timeZone: SAO_PAULO_TIME_ZONE,
        weekday: "short",
    }).format(date);

    const dayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
    };

    return dayMap[shortWeekDay] ?? 0;
}

function createSaoPauloDateTime(ymd: string, time: string): Date {
    return new Date(`${ymd}T${time}:00-03:00`);
}

function compareTime(time1: string, time2: string): number {
    const [h1, m1] = time1.split(":").map(Number);
    const [h2, m2] = time2.split(":").map(Number);
    const mins1 = h1 * 60 + m1;
    const mins2 = h2 * 60 + m2;
    return mins1 - mins2;
}

function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

function addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const resultHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const resultMinutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${resultHours}:${resultMinutes}`;
}

function intervalsOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
    return startA < endB && startB < endA;
}

function generateTimeSlots(
    intervalStart: string,
    intervalEnd: string,
    durationMinutes: number,
) {
    const slots: string[] = [];
    let currentSlot = intervalStart;

    while (compareTime(addMinutesToTime(currentSlot, durationMinutes), intervalEnd) <= 0) {
        slots.push(currentSlot);
        currentSlot = addMinutesToTime(currentSlot, durationMinutes);
    }

    return slots;
}

function isTimeInPast(timeSlot: string, selectedDateYmd: string): boolean {
    const now = new Date();
    const nowYmd = getDatePartsInSaoPaulo(now).ymd;
    const nowTime = new Intl.DateTimeFormat("pt-BR", {
        timeZone: SAO_PAULO_TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(now);

    const slotTime = createSaoPauloDateTime(selectedDateYmd, timeSlot);
    const nowInSaoPaulo = createSaoPauloDateTime(nowYmd, nowTime);

    return slotTime <= nowInSaoPaulo;
}

export const getDateAvailableTimeSlots = actionClient
    .inputSchema(inputSchema)
    .action(async ({ parsedInput: { barbershopId, serviceId, date } }) => {
        const now = new Date();

        const selectedDateYmd = getDatePartsInSaoPaulo(date).ymd;
        const todayYmd = getDatePartsInSaoPaulo(now).ymd;
        const selectedDateNormalized = new Date(`${selectedDateYmd}T00:00:00-03:00`);
        const todayNormalized = new Date(`${todayYmd}T00:00:00-03:00`);

        if (selectedDateNormalized < todayNormalized) {
            return [];
        }

        const service = await prisma.barbershopService.findUnique({
            where: { id: serviceId },
            select: {
                durationMinutes: true,
                barbershopId: true,
            },
        });

        if (!service || service.barbershopId !== barbershopId) {
            return [];
        }

        const serviceDurationMinutes = service.durationMinutes;

        const businessHours = await getBusinessHours(barbershopId);
        const dayOfWeek = getDayOfWeekInSaoPaulo(date);
        const dayHours = businessHours.find((h) => h.dayOfWeek === dayOfWeek);

        if (!dayHours || dayHours.isClosed) {
            return [];
        }

        const employeesCount = await prisma.user.count({
            where: {
                barbershopId,
                role: "EMPLOYEE",
            },
        });

        if (employeesCount === 0) {
            return [];
        }

        const bookings = await prisma.booking.findMany({
            where: {
                barbershopId,
                date: {
                    gte: new Date(`${selectedDateYmd}T00:00:00-03:00`),
                    lte: new Date(`${selectedDateYmd}T23:59:59.999-03:00`),
                },
                cancelledAt: null,
            },
            include: {
                service: {
                    select: {
                        durationMinutes: true,
                    },
                },
            },
        });

        const bookedIntervals = bookings.map((booking) => {
            const bookingStart = booking.date;
            const bookingEnd = addMinutes(bookingStart, booking.service.durationMinutes);
            return { bookingStart, bookingEnd };
        });

        const morningSlots = dayHours.lunchStart && dayHours.lunchEnd
            ? generateTimeSlots(dayHours.openingTime!, dayHours.lunchStart, serviceDurationMinutes)
            : generateTimeSlots(dayHours.openingTime!, dayHours.closingTime!, serviceDurationMinutes);

        const afternoonSlots = dayHours.lunchStart && dayHours.lunchEnd
            ? generateTimeSlots(dayHours.lunchEnd, dayHours.closingTime!, serviceDurationMinutes)
            : [];

        const allSlots = [...morningSlots, ...afternoonSlots];
        const isToday = selectedDateYmd === todayYmd;

        const availableTimeSlots = allSlots.filter((slotTime) => {
            if (isToday && isTimeInPast(slotTime, selectedDateYmd)) {
                return false;
            }

            const slotStart = createSaoPauloDateTime(selectedDateYmd, slotTime);
            const slotEnd = addMinutes(slotStart, serviceDurationMinutes);

            const overlappingBookings = bookedIntervals.filter(({ bookingStart, bookingEnd }) =>
                intervalsOverlap(slotStart, slotEnd, bookingStart, bookingEnd),
            ).length;

            return overlappingBookings < employeesCount;
        });

        return availableTimeSlots;
    });