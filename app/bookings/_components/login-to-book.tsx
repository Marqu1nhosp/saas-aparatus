"use client";

import { toast } from "sonner";

import { GoogleIcon } from "@/components/google-icon";
import { authClient } from "@/lib/auth-client";

export function LoginToBook() {
    const handleLogin = async () => {
        const { error } = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/bookings",
            newUserCallbackURL: "/bookings",
        });

        if (error) {
            toast.error("Erro ao fazer login: " + error.message);
        }
    };

    return (
        <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
            <p className="mb-4 text-muted-foreground">
                Faça seu login para consultar seus agendamentos e reservar um horário.
            </p>
            <button
                type="button"
                onClick={handleLogin}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
                <GoogleIcon />
                Fazer login e agendar
            </button>
        </div>
    );
}
