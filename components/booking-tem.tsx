import { AvatarImage } from "@radix-ui/react-avatar";

import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

export function BookingItem() {
    return (
        <Card className="flex h-full w-full cursor-pointer flex-row items-center justify-between p-0 mt-4">
            <div className="flex flex-1 flex-col gap-4 p-4">
                <Badge>Confirmado</Badge>
                <div className="flex flex-col gap-2">
                    <p className="font-bold">Corte de cabelo</p>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src="https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png" />
                        </Avatar>
                        <p className="text-sm font-medium">Barbearia do Maurício</p>
                    </div>
                </div>
            </div>

            <div className="flex h-full flex-col items-center justify-center border-l py-3 w-26.5">
                <p className="text-xs capitalize">Fevereiro</p>
                <p className="text-2xl">13</p>
                <p className="text-xs">09:45</p>
            </div>
        </Card>
    )
}