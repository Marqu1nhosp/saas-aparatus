"use client";

import { Eye, Footprints, Scissors, Sparkles, User, Waves } from "lucide-react";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Input } from "./ui/input";
import { PageSectionScroller } from "./ui/page";

const QuickSearch = () => {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState("");

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!searchValue.trim()) return;
        router.push(`/barbershops?search=${encodeURIComponent(searchValue.trim())}`);
    };

    return (
        <>
            <form onSubmit={handleSearch} className="w-full">
                <div className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 shadow-sm dark:border-white/10 dark:bg-[#1b2423] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <SearchIcon className="h-4 w-4 text-muted-foreground dark:text-[#cfe5df]" />
                    <Input
                        className="h-auto flex-1 border-0 bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-white dark:placeholder:text-[#9db1ab]"
                        placeholder="Pesquisar"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
            </form>
            <PageSectionScroller>
                <Link
                    href="/barbershops?search=cabelo"
                    className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/5"
                >
                    <Scissors className="size-4" />
                    <span className="text-card-foreground text-sm font-medium">
                        Cabelo
                    </span>
                </Link>

                <Link
                    href="/barbershops?search=barba"
                    className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/5"
                >
                    <User className="size-4" />
                    <span className="text-card-foreground text-sm font-medium">
                        Barba
                    </span>
                </Link>

                <Link
                    href="/barbershops?search=acabamento"
                    className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/5"
                >
                    <Sparkles className="size-4" />
                    <span className="text-card-foreground text-sm font-medium">
                        Acabamento
                    </span>
                </Link>

                <Link
                    href="/barbershops?search=sobrancelha"
                    className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/5"
                >
                    <Eye className="size-4" />
                    <span className="text-card-foreground text-sm font-medium">
                        Sobrancelha
                    </span>
                </Link>

                <Link
                    href="/barbershops?search=pézinho"
                    className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/5"
                >
                    <Footprints className="size-4" />
                    <span className="text-card-foreground text-sm font-medium">
                        Pézinho
                    </span>
                </Link>

                <Link
                    href="/barbershops?search=progressiva"
                    className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/5"
                >
                    <Waves className="size-4" />
                    <span className="text-card-foreground text-sm font-medium">
                        Progressiva
                    </span>
                </Link>
            </PageSectionScroller>
        </>
    );
};

export default QuickSearch;