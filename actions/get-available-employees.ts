"use server";

import { z } from "zod";

import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";

const getAvailableEmployeesSchema = z.object({
    barbershopId: z.string().uuid(),
    dateTime: z.coerce.date().refine((date) => !Number.isNaN(date.getTime()), {
        message: "Data e hora inválidas",
    }),
    durationMinutes: z.number().int().min(1).optional(),
});

function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

function intervalsOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
    return startA < endB && startB < endA;
}

export const getAvailableEmployees = actionClient
    .inputSchema(getAvailableEmployeesSchema)
    .action(async ({ parsedInput: { barbershopId, dateTime, durationMinutes } }) => {
        try {
            const employees = await prisma.user.findMany({
                where: {
                    barbershopId,
                    role: "EMPLOYEE",
                },
                orderBy: {
                    name: "asc",
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true,
                    employeeBookings: {
                        where: {
                            cancelledAt: null,
                            date: {
                                gte: new Date(new Date(dateTime).setHours(0, 0, 0, 0)),
                                lte: new Date(new Date(dateTime).setHours(23, 59, 59, 999)),
                            },
                        },
                        include: {
                            service: {
                                select: {
                                    durationMinutes: true,
                                },
                            },
                        },
                    },
                },
            });

            const available = employees.map((employee) => {
                const isAvailable = durationMinutes
                    ? employee.employeeBookings.every((booking) => {
                        const bookingStart = booking.date;
                        const bookingEnd = addMinutes(
                            bookingStart,
                            booking.service.durationMinutes,
                        );
                        const desiredEnd = addMinutes(dateTime, durationMinutes);

                        return !intervalsOverlap(
                            dateTime,
                            desiredEnd,
                            bookingStart,
                            bookingEnd,
                        );
                    })
                    : employee.employeeBookings.every((booking) => booking.date.getTime() !== dateTime.getTime());

                return {
                    ...employee,
                    isAvailable,
                };
            });

            return {
                available: available.filter((emp) => emp.isAvailable),
                unavailable: available.filter((emp) => !emp.isAvailable),
            };
        } catch (error) {
            throw new Error(`Erro ao buscar barbeiros disponíveis: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
