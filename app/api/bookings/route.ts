import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bookings = await prisma.booking.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                barbershop: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                        priceInCents: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });

        return Response.json({ bookings });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
