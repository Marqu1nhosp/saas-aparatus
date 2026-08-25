"use client"

import {
    Calendar,
    Eye,
    Home,
    LogOut,
    MenuIcon,
    MessageSquare,
    Scissors,
    Sparkles,
    UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { GoogleIcon } from "./google-icon";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet";

const menuSections = [
    { href: "/barbershops?search=cabelo", label: "Cabelo", icon: Scissors },
    { href: "/barbershops?search=barba", label: "Barba", icon: UserRound },
    { href: "/barbershops?search=acabamento", label: "Acabamento", icon: Sparkles },
    { href: "/barbershops?search=sobrancelha", label: "Sobrancelha", icon: Eye },
    { href: "/barbershops?search=massagem", label: "Massagem", icon: MessageSquare },
];

export function MenuSheet() {
    const { data: session } = authClient.useSession();

    useEffect(() => {
        if (session?.user?.id) {
            const ensureRole = async () => {
                try {
                    const response = await fetch("/api/ensure-client-role", {
                        method: "POST",
                    });

                    if (!response.ok) {
                        console.error("[MenuSheet] Failed to fix role:", response.status);
                    }
                } catch (err) {
                    console.error("[MenuSheet] Error ensuring client role:", err);
                }
            };

            ensureRole();
        }
    }, [session?.user?.id]);

    async function handleLogin() {
        const { error } = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/",
            newUserCallbackURL: "/",
        });

        if (error) {
            toast.error("Erro ao fazer login: " + error.message);
            return;
        }

        try {
            const response = await fetch("/api/ensure-client-role", {
                method: "POST",
            });

            if (!response.ok) {
                console.warn("Failed to ensure client role");
            }
        } catch (err) {
            console.error("Error ensuring client role:", err);
        }
    }

    const isLoggedIn = !!session?.user;

    async function handleLogout() {
        await authClient.signOut();
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    className="h-10 w-10 rounded-md border-border bg-card p-0 text-foreground shadow-sm hover:bg-accent dark:border-white/10 dark:bg-[#141d1c] dark:text-white dark:hover:bg-white/5"
                >
                    <MenuIcon className="h-4 w-4" />
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="border-0 bg-card p-0 text-card-foreground dark:text-white">
                <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
                <div className="flex h-full flex-col p-5">
                    <div className="mb-4 mt-6">
                        {isLoggedIn ? (
                            <div className="flex items-center gap-3">
                                <Avatar className="h-11 w-11 overflow-hidden rounded-full border border-border bg-muted">
                                    <AvatarImage
                                        src={session.user.image ?? ""}
                                        alt={session.user.name}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-muted text-foreground dark:bg-[#1b2a28] dark:text-white">
                                        {session.user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col text-left">
                                    <span className="text-sm font-semibold text-foreground dark:text-white">
                                        {session.user.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground dark:text-[#9bb0ab]">
                                        {session.user.email}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 rounded-lg border border-border/50 bg-muted/30 p-6">
                                <div>
                                    <h3 className="text-base font-semibold text-foreground dark:text-white">
                                        Bem-vindo
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground dark:text-[#9bb0ab]">
                                        Faça login para agendar com facilidade e acompanhar seus horários
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleLogin}
                                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    <GoogleIcon />
                                    Entrar com Google
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="mb-6 h-px bg-border dark:bg-white/8" />

                    <div className="space-y-2">
                        <SheetClose asChild>
                            <Link href="/" className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent dark:text-white dark:hover:bg-white/5">
                                <Home className="h-4 w-4" />
                                Início
                            </Link>
                        </SheetClose>

                        <SheetClose asChild>
                            <Link href="/bookings" className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent dark:text-white dark:hover:bg-white/5">
                                <Calendar className="h-4 w-4" />
                                Agendamentos
                            </Link>
                        </SheetClose>
                    </div>

                    <div className="my-4 h-px bg-border dark:bg-white/8" />

                    <div className="space-y-2">
                        {menuSections.map(({ href, label, icon: Icon }) => (
                            <SheetClose key={href} asChild>
                                <Link href={href} className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground dark:text-white dark:hover:bg-white/5 dark:hover:text-white">
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </Link>
                            </SheetClose>
                        ))}
                    </div>

                    <div className="mt-auto pt-5">
                        <div className="h-px bg-border dark:bg-white/8" />
                        {isLoggedIn && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-4 flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent dark:text-[#dfe9e6] dark:hover:bg-white/5"
                            >
                                <LogOut className="h-4 w-4" />
                                Sair da conta
                            </button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}