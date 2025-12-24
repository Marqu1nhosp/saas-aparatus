"use server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import prisma from "@/lib/prisma";

const inputSchema = z.object({
    bookingId: z.string().uuid(),
});

export const cancelBooking = protectedActionClient
    .inputSchema(inputSchema)
    .action(async ({ parsedInput: { bookingId }, ctx: { user } }) => {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            return returnValidationErrors(inputSchema, {
                _errors: ["Agendamento não encontrado"],
            });
        }

        if (booking.userId !== user.id) {
            return returnValidationErrors(inputSchema, {
                _errors: ["Você não tem permissão para cancelar este agendamento"],
            });
        }

        if (booking.cancelledAt) {
            return returnValidationErrors(inputSchema, {
                _errors: ["Este agendamento já foi cancelado"],
            });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                cancelledAt: new Date(),
            },
        });

        return updatedBooking;
    });


