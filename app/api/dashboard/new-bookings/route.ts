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

        // Get the last viewed time from the query parameter
        const url = new URL(request.url);
        const lastViewedTime = url.searchParams.get('lastViewed');

        // Determine the "since" date for counting new bookings
        let since: Date;
        if (lastViewedTime) {
            since = new Date(parseInt(lastViewedTime, 10));
        } else {
            since = new Date();
            since.setDate(since.getDate() - 1);
        }

        const newBookingCount = await prisma.booking.count({
            where: {
                barbershopId: user.barbershopId,
                cancelledAt: null,
                createdAt: {
                    gte: since,
                },
            },
        });

        return Response.json({ newBookingCount });
    } catch (error) {
        console.error('Error fetching new booking count:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
