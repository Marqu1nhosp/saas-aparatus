"use server";

import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { actionClient } from "@/lib/action-client";

const createBookingSchema = z.object({
    barbershopId: z.string().uuid(),
    serviceId: z.string().uuid(),
    date: z.string().datetime(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const createBooking = actionClient
    .schema(createBookingSchema)
    .action(async ({ parsedInput }) => {
        const { prisma, user } = await protectedActionClient();

        if (!user?.id) {
            throw new Error("User not authenticated");
        }

        // Validate that the service exists and get its details
        const service = await prisma.barbershopService.findUnique({
            where: { id: parsedInput.serviceId },
        });

        if (!service) {
            throw new Error("Service not found");
        }

        // Validate that the barbershop exists
        const barbershop = await prisma.barbershop.findUnique({
            where: { id: parsedInput.barbershopId },
        });

        if (!barbershop) {
            throw new Error("Barbershop not found");
        }

        // Create the booking
        const booking = await prisma.booking.create({
            data: {
                barbershopId: parsedInput.barbershopId,
                serviceId: parsedInput.serviceId,
                date: new Date(parsedInput.date),
                userId: user.id,
            },
            include: {
                service: true,
                barbershop: true,
            },
        });

        return {
            success: true,
            booking,
        };
    });
