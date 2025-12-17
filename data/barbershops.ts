//Data Access Layer
import { prisma } from "@/lib/prisma";

export async function getBarberShops() {
    try {
        const barbershop = await prisma.barbershop.findMany();
        return barbershop;
    } catch (error) {
        console.error('Error fetching barbershops', error)
        return []
    }
}

export async function getBarbershopById(id: string) {
    try {
        const barbershop = await prisma.barbershop.findUnique({
            where: { id },
            include: { services: true },
        });
        return barbershop;
    } catch (error) {
        console.error('Error fetching barbershop by id', error)
        return null;
    }
}
export async function getPopularBarbershops() {
    try {
        const barbershop = await prisma.barbershop.findMany({
            orderBy: {
                name: "desc"
            }
        });
        return barbershop;
    } catch (error) {
        console.error('Error fetching popular barbershops', error)
        return []
    }
}

export const getBarbershopsByServiceName = async (serviceName: string) => {
    const barbershops = await prisma.barbershop.findMany({
        where: {
            services: {
                some: {
                    name: {
                        contains: serviceName,
                        mode: "insensitive",
                    },
                },
            },
        },
    });
    return barbershops;
};