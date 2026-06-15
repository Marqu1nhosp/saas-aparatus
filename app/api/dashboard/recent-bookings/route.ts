import { headers } from 'next/headers';

import { extractDashboardToken, parseDashboardToken } from '@/lib/dashboard-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const headersList = await headers();
        const authHeader = headersList.get('authorization');
        const cookieHeader = headersList.get('cookie');

        const token = extractDashboardToken(authHeader || undefined, cookieHeader || undefined);

        if (!token) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = parseDashboardToken(token);

        if (!user || !user.barbershopId) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '5', 10);

        const bookings = await prisma.booking.findMany({
            where: {
                barbershopId: user.barbershopId,
                cancelledAt: null,
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
            select: {
                id: true,
                date: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                    },
                },
                service: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        const formattedBookings = bookings.map((booking) => {
            const bookingDate = new Date(booking.date);
            const time = bookingDate.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
            });
            const date = bookingDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
            });

            return {
                id: booking.id,
                clientName: booking.user?.name || 'Cliente',
                serviceName: booking.service?.name || 'Serviço',
                date: `${date} às ${time}`,
            };
        });

        return Response.json({ bookings: formattedBookings });
    } catch (error) {
        console.error('Error fetching recent bookings:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
