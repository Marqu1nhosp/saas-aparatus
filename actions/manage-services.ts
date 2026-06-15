'use server';

import { headers } from 'next/headers';
import { returnValidationErrors } from 'next-safe-action';
import { z } from 'zod';

import { BarbershopServiceStatus, Role } from '@/generated/prisma/enums';
import { actionClient } from '@/lib/action-client';
import { extractDashboardToken, parseDashboardToken } from '@/lib/dashboard-auth';
import { prisma } from '@/lib/prisma';

const imageUrlSchema = z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? '')
    .refine((value) => !value || /^https?:\/\/.+/.test(value), {
        message: 'URL de imagem inválida',
    });

const createServiceSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
    priceInCents: z.number().int().min(0, 'Preço deve ser maior ou igual a 0'),
    durationMinutes: z.number().int().min(1, 'Duração deve ser maior ou igual a 1 minuto'),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    imageUrl: imageUrlSchema,
    barbershopId: z.string().uuid('ID da barbearia inválido'),
});

const updateServiceSchema = createServiceSchema.extend({
    id: z.string().uuid('ID do serviço inválido'),
});

const deleteServiceSchema = z.object({
    id: z.string().uuid('ID do serviço inválido'),
    barbershopId: z.string().uuid('ID da barbearia inválido'),
});

export async function getServicesByBarbershop(barbershopId: string) {
    const services = await prisma.barbershopService.findMany({
        where: {
            barbershopId,
        },
        select: {
            id: true,
            name: true,
            description: true,
            priceInCents: true,
            durationMinutes: true,
            status: true,
            imageUrl: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    return services;
}

const requireAdminForBarbershop = async (barbershopId: string) => {
    const requestHeaders = await headers();
    const authHeader = requestHeaders.get('authorization') ?? undefined;
    const cookieHeader = requestHeaders.get('cookie') ?? undefined;

    const token = extractDashboardToken(authHeader, cookieHeader);

    if (!token) {
        throw new Error('Você precisa estar logado no dashboard para gerenciar serviços');
    }

    const userPayload = parseDashboardToken(token);

    if (!userPayload) {
        throw new Error('Token inválido ou expirado. Faça login novamente');
    }

    const adminUser = await prisma.user.findUnique({
        where: { id: userPayload.id },
    });

    if (!adminUser || adminUser.role !== Role.ADMIN || adminUser.barbershopId !== barbershopId) {
        throw new Error('Você não tem permissão para gerenciar serviços nesta barbearia');
    }

    return adminUser;
};

export const createService = actionClient
    .inputSchema(createServiceSchema)
    .action(async ({ parsedInput: { name, description, priceInCents, durationMinutes, status, imageUrl, barbershopId } }) => {
        try {
            await requireAdminForBarbershop(barbershopId);

            const existingService = await prisma.barbershopService.findFirst({
                where: {
                    barbershopId,
                    name,
                },
            });

            if (existingService) {
                return returnValidationErrors(createServiceSchema, {
                    _errors: ['Já existe um serviço com esse nome nesta barbearia'],
                });
            }

            const service = await prisma.barbershopService.create({
                data: {
                    name,
                    description,
                    priceInCents,
                    durationMinutes,
                    status: status as BarbershopServiceStatus,
                    barbershopId,
                    imageUrl: imageUrl || '',
                },
            });

            return service;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido ao cadastrar serviço';
            return returnValidationErrors(createServiceSchema, {
                _errors: [message],
            });
        }
    });

export const updateService = actionClient
    .inputSchema(updateServiceSchema)
    .action(async ({ parsedInput: { id, name, description, priceInCents, durationMinutes, status, imageUrl, barbershopId } }) => {
        try {
            await requireAdminForBarbershop(barbershopId);

            const existingService = await prisma.barbershopService.findFirst({
                where: {
                    id,
                    barbershopId,
                },
            });

            if (!existingService) {
                return returnValidationErrors(updateServiceSchema, {
                    _errors: ['Serviço não encontrado'],
                });
            }

            const serviceWithSameName = await prisma.barbershopService.findFirst({
                where: {
                    barbershopId,
                    name,
                    NOT: {
                        id,
                    },
                },
            });

            if (serviceWithSameName) {
                return returnValidationErrors(updateServiceSchema, {
                    _errors: ['Já existe outro serviço com esse nome nesta barbearia'],
                });
            }

            const service = await prisma.barbershopService.update({
                where: { id },
                data: {
                    name,
                    description,
                    priceInCents,
                    durationMinutes,
                    status: status as BarbershopServiceStatus,
                    imageUrl: imageUrl || '',
                },
            });

            return service;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido ao atualizar serviço';
            return returnValidationErrors(updateServiceSchema, {
                _errors: [message],
            });
        }
    });

export const deleteService = actionClient
    .inputSchema(deleteServiceSchema)
    .action(async ({ parsedInput: { id, barbershopId } }) => {
        try {
            await requireAdminForBarbershop(barbershopId);

            const existingService = await prisma.barbershopService.findFirst({
                where: {
                    id,
                    barbershopId,
                },
            });

            if (!existingService) {
                return returnValidationErrors(deleteServiceSchema, {
                    _errors: ['Serviço não encontrado'],
                });
            }

            await prisma.barbershopService.delete({
                where: { id },
            });

            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido ao excluir serviço';
            return returnValidationErrors(deleteServiceSchema, {
                _errors: [message],
            });
        }
    });
