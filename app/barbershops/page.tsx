import { Search } from "lucide-react";

import BarbershopItem from "@/components/barbershop-item";
import Header from "@/components/header";
import {
    PageContainer,
    PageSectionContent,
} from "@/components/ui/page";
import { searchBarbershops } from "@/data/barbershops";

interface BarbershopsPageProps {
    searchParams?:
    | { search?: string | string[] }
    | Promise<{ search?: string | string[] }>;
}

const BarbershopsPage = async ({ searchParams }: BarbershopsPageProps) => {
    const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : undefined;
    const rawSearch = resolvedSearchParams?.search;
    const search = Array.isArray(rawSearch) ? rawSearch[0] : rawSearch;

    const barbershops = await searchBarbershops(search);

    return (
        <div>
            <Header />
            <PageContainer>
                <form action="/barbershops" method="get" className="mb-4">
                    <div className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 shadow-sm dark:border-white/10 dark:bg-[#1b2423] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <Search className="h-4 w-4 text-muted-foreground dark:text-[#cfe5df]" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={search || ""}
                            placeholder="Pesquisar barbearia"
                            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none dark:text-white dark:placeholder:text-[#9db1ab]"
                        />
                    </div>
                </form>

                <PageSectionContent>
                    {barbershops.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            Nenhuma barbearia encontrada.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {barbershops.map((barbershop) => (
                                <BarbershopItem
                                    key={barbershop.id}
                                    barbershop={barbershop}
                                />
                            ))}
                        </div>
                    )}
                </PageSectionContent>
            </PageContainer>
        </div>
    );
};

export default BarbershopsPage;
