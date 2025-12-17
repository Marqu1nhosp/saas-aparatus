"use client";

import Image from "next/image";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Service = {
    id: string;
    name: string;
    description?: string | null;
    priceInCents?: number | null;
    imageUrl?: string | null;
    barbershopId?: string;
};

export default function ServiceItem({
    service,
}: {
    service: Service;
    barbershop?: unknown;
}) {
    const price = service.priceInCents
        ? new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(service.priceInCents / 100)
        : "";

    return (
        <Card className="p-3">
            <CardHeader className="flex items-start gap-4 p-0">
                <div className="relative shrink-0 w-20 h-20 rounded-md bg-muted overflow-hidden">
                    {service.imageUrl ? (
                        <Image
                            src={service.imageUrl}
                            alt={service.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 4rem, 5rem"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full">
                            <span className="text-base font-semibold text-black">{price || ""}</span>
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <CardTitle className="text-sm font-medium">
                        <span>{service.name}</span>
                    </CardTitle>
                    {service.description && (
                        <CardDescription className="mt-1">{service.description}</CardDescription>
                    )}
                    {price && (
                        <div className="mt-2 text-sm font-semibold text-black">{price}</div>
                    )}
                </div>

                <CardAction>
                    <Button variant="default" size="sm" onClick={() => { }}>
                        Reservar
                    </Button>
                </CardAction>
            </CardHeader>
        </Card>
    );
}
