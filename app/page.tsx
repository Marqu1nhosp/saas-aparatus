// eslint-disable-next-line simple-import-sort/imports
import { BookingItem } from "@/components/booking-tem";
import Header from "@/components/header";
import banner from "@/public/banner.png";
import Image from "next/image";

import { BarbershopItem } from "@/components/barbershop-item";
import { PageContainer, PageSectionContent, PageSectionScroller, PageSectionTitle } from "@/components/ui/page";
import { getBarberShops, getPopularBarbershops } from "@/data/barbershops";
import QuickSearch from "@/components/quick-search";

export default async function Home() {
  const barbershops = await getBarberShops();
  const popularBarbershops = await getPopularBarbershops();

  return (
    <div>
      <Header />
      <PageContainer>
        <QuickSearch />
        <Image src={banner} alt="Agende nos melhores com a Aparatus" sizes="100vw" className="h-auto w-full" />
        <PageSectionContent>
          <PageSectionTitle>
            Agendamentos
          </PageSectionTitle>
          <BookingItem />
        </PageSectionContent>

        <PageSectionContent>
          <PageSectionTitle>
            Barbearias
          </PageSectionTitle>
          <PageSectionScroller>
            {barbershops.map((barbershop) => (
              < BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageSectionScroller>
        </PageSectionContent>

        <PageSectionContent>
          <PageSectionTitle>
            Barbearias Populares
          </PageSectionTitle>
          <PageSectionScroller>
            {popularBarbershops.map((popularBarbershop) => (
              < BarbershopItem key={popularBarbershop.id} barbershop={popularBarbershop} />
            ))}
          </PageSectionScroller>
        </PageSectionContent>
      </PageContainer>
    </div >
  );
}
