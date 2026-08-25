"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { canCancelByPolicy, getCancellationPolicyMessage } from "@/lib/cancellation-policy";
import prisma from "@/lib/prisma";

const inputSchema = z.object({
    bookingId: z.uuid(),
});

export const cancelBooking = protectedActionClient
    .inputSchema(inputSchema)
    .action(async ({ parsedInput: { bookingId }, ctx: { user } }) => {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                barbershop: {
                    select: {
                        cancellationNoticeHours: true,
                    },
                },
            },
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

        const cancellationNoticeHours = booking.barbershop.cancellationNoticeHours ?? 2;
        if (!canCancelByPolicy(booking.date, cancellationNoticeHours)) {
            return returnValidationErrors(inputSchema, {
                _errors: [getCancellationPolicyMessage(cancellationNoticeHours)],
            });
        }

        const cancelledBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                cancelledAt: new Date(),
            },
            include: {
                user: true,
                service: true,
            },
        });

        revalidatePath("/");
        revalidatePath("/bookings");

        return cancelledBooking;
    });


