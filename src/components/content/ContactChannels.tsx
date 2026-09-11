import { site } from "@/content/site";
import {
  cx,
  formatPhoneHref,
  telegramHref,
  whatsAppHref,
} from "@/lib/utils";

type ContactChannelsProps = {
  variant?: "onDark" | "onLight" | "compact";
  className?: string;
};

const channels = [
  {
    id: "call",
    label: "Call",
    href: () => formatPhoneHref(site.phone),
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M5.5 4h2.8l1.4 3.5-1.8 1.1a11.5 11.5 0 0 0 5.5 5.5l1.1-1.8 3.5 1.4v2.8c0 .8-.7 1.5-1.5 1.5C10.2 18 6 13.8 6 8.5 6 7.7 6.7 7 7.5 7H5.5Z"
        />
      </svg>
    ),
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: () => whatsAppHref(site.phone),
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
  },
  {
    id: "telegram",
    label: "Telegram",
    href: () => telegramHref(site.phone),
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
] as const;

function channelIconClass(channelId: (typeof channels)[number]["id"], isDark: boolean) {
  return cx(
    "flex items-center justify-center rounded-full ring-1 transition group-hover:scale-105",
    channelId === "call" &&
      (isDark ? "bg-gold/15 text-gold-glow ring-gold/30" : "bg-gold/10 text-gold ring-gold/25"),
    channelId === "whatsapp" && "bg-[#25D366]/15 text-[#25D366] ring-[#25D366]/30",
    channelId === "telegram" && "bg-[#229ED9]/15 text-[#229ED9] ring-[#229ED9]/30",
  );
}

export function ContactChannels({ variant = "onDark", className }: ContactChannelsProps) {
  const isDark = variant === "onDark" || variant === "compact";

  if (variant === "compact") {
    return (
      <div className={cx("flex flex-wrap gap-2.5", className)}>
        {channels.map((channel) => (
          <a
            key={channel.id}
            href={channel.href()}
            {...(channel.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            aria-label={`${channel.label} NorthPeak at ${site.phone}`}
            title={channel.label}
            className={cx(
              "group flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/5 text-cream transition hover:border-gold/40 hover:bg-white/10",
              channelIconClass(channel.id, isDark),
              "h-11 w-11 ring-0 [&_svg]:h-[1.15rem] [&_svg]:w-[1.15rem]",
            )}
          >
            {channel.icon}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={cx("flex flex-wrap gap-3", className)}>
      {channels.map((channel) => (
        <a
          key={channel.id}
          href={channel.href()}
          {...(channel.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          aria-label={`${channel.label} NorthPeak at ${site.phone}`}
          className={cx(
            "group flex min-w-[5.5rem] flex-1 flex-col items-center gap-2 rounded-2xl border px-3 py-3.5 transition sm:min-w-0 sm:flex-none sm:px-4",
            isDark
              ? "border-cream/15 bg-cream/5 text-cream hover:border-gold/40 hover:bg-cream/10"
              : "border-navy/10 bg-white text-navy hover:border-gold/35 hover:bg-cream/40",
          )}
        >
          <span className={cx(channelIconClass(channel.id, isDark), "h-11 w-11")}>
            {channel.icon}
          </span>
          <span className="text-xs font-semibold tracking-wide">{channel.label}</span>
        </a>
      ))}
    </div>
  );
}
