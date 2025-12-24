//Data Access Layer
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUserBookings() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return [];
        }

        const bookings = await prisma.booking.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                        priceInCents: true,
                    },
                },
                barbershop: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });

        return bookings;
    } catch (error) {
        console.error("Error fetching user bookings", error);
        return [];
    }
}

export async function getBookingById(bookingId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return null;
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                        priceInCents: true,
                    },
                },
                barbershop: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        imageUrl: true,
                        phones: true,
                    },
                },
            },
        });

        if (!booking || booking.userId !== session.user.id) {
            return null;
        }

        return booking;
    } catch (error) {
        console.error("Error fetching booking by id", error);
        return null;
    }
}

