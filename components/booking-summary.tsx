import Image from "next/image";

interface BookingSummaryProps {
    serviceName: string;
    barbershopName: string;
    serviceImageUrl?: string | null;
    date: Date | string;
    time?: string;
    priceInCents?: number | null;
}

export function BookingSummary({
    serviceName,
    barbershopName,
    serviceImageUrl,
    date,
    time,
    priceInCents,
}: BookingSummaryProps) {
    const formattedDate = date instanceof Date
        ? date.toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
          })
        : new Date(date).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
          });

    const price = priceInCents
        ? new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
          }).format(priceInCents / 100)
        : "";

    return (
        <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/50 p-4">
            <div className="space-y-3">
                <div className="flex gap-3">
                    <div className="relative shrink-0 w-12 h-12 rounded-md bg-background overflow-hidden">
                        {serviceImageUrl ? (
                            <Image
                                src={serviceImageUrl}
                                alt={serviceName}
                                fill
                                className="object-cover"
                                sizes="3rem"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-muted">
                                <span className="text-xs font-semibold">-</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{serviceName}</p>
                        <p className="text-xs text-muted-foreground">
                            {barbershopName}
                        </p>
                    </div>
                </div>

                <div className="space-y-1 border-t border-border pt-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Data:</span>
                        <span className="font-medium">{formattedDate}</span>
                    </div>
                    {time && (
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                                Horário:
                            </span>
                            <span className="font-medium">{time}</span>
                        </div>
                    )}
                </div>

                {price && (
                    <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
                        <span>Total:</span>
                        <span>{price}</span>
                    </div>
                )}
            </div>
        </div>
    );
}


