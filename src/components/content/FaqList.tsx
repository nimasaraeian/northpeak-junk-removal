import type { FaqItem } from "@/types";

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-navy/8 border-y border-navy/8">
      {items.map((item) => (
        <details key={item.question} className="group py-6">
          <summary className="cursor-pointer list-none text-lg font-medium text-navy marker:hidden">
            <span className="flex items-center justify-between gap-6">
              {item.question}
              <span className="text-gold transition group-open:rotate-45">+</span>
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-base leading-7 text-stone">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
