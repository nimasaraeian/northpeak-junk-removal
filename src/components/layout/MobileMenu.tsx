"use client";

import { TransitionLink } from "@/components/motion/TransitionLink";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { navigation } from "@/content/site";
import { cx } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-navy/10"
        aria-expanded={open}
        aria-label="Open menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex w-4 flex-col gap-1.5">
          <span className={cx("h-px bg-navy transition", open && "translate-y-1 rotate-45")} />
          <span className={cx("h-px bg-navy transition", open && "opacity-0")} />
          <span className={cx("h-px bg-navy transition", open && "-translate-y-1 -rotate-45")} />
        </span>
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-full border-t border-navy/8 bg-paper">
          <Container className="flex flex-col gap-4 py-6">
            {navigation.map((item) => (
              <TransitionLink
                key={item.href}
                href={item.href}
                className="text-lg text-navy"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </TransitionLink>
            ))}
            <Button href="/estimate" className="mt-2 w-full">
              Get Estimate
            </Button>
          </Container>
        </div>
      ) : null}
    </div>
  );
}
