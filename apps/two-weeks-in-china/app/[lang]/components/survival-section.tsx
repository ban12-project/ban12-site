import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/components/accordion';
import { AppWindow, CreditCard, MapPin, Wifi } from 'lucide-react';
import type { Messages } from '#/lib/i18n';

export function SurvivalSection({ dict }: { dict: Messages }) {
  const survivalItems = [
    {
      name: 'items',
      icon: CreditCard,
      title: dict.sections.survival.items.payment.title,
      subtitle: dict.sections.survival.items.payment.subtitle,
      content: dict.sections.survival.items.payment.content,
    },
    {
      name: 'internet',
      icon: Wifi,
      title: dict.sections.survival.items.internet.title,
      subtitle: dict.sections.survival.items.internet.subtitle,
      content: dict.sections.survival.items.internet.content,
    },
    {
      name: 'apps',
      icon: AppWindow,
      title: dict.sections.survival.items.apps.title,
      subtitle: dict.sections.survival.items.apps.subtitle,
      content: dict.sections.survival.items.apps.content,
    },
    {
      name: 'accommodation',
      icon: MapPin,
      title: dict.sections.survival.items.accommodation.title,
      subtitle: dict.sections.survival.items.accommodation.subtitle,
      content: dict.sections.survival.items.accommodation.content,
    },
  ];

  return (
    <section id="survival" className="grid gap-10 scroll-mt-24">
      <div className="flex items-center gap-4">
        <div className="bg-primary p-2 rounded-[7px]">
          <h2 className="text-3xl font-medium text-dark">
            {dict.sections.survival.num} {dict.sections.survival.title}
          </h2>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full grid gap-6">
        {survivalItems.map((item) => (
          <AccordionItem
            key={item.name}
            id={item.name}
            value={item.name}
            className="data-[state=open]:bg-primary data-[state=closed]:bg-grey rounded-[20px] border-none px-6 shadow-sm scroll-mt-24 transition-colors duration-200"
          >
            <AccordionTrigger className="hover:no-underline py-6">
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-white rounded-full border border-dark">
                  <item.icon className="w-6 h-6 text-dark" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-dark">{item.title}</h3>
                  <p className="text-sm text-dark/70 font-normal">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-dark/80 text-lg">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
