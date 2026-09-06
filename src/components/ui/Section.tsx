import { cx } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

export function Section({
  children,
  className,
  id,
  width = "default",
  eyebrow,
  title,
  description,
  action,
}: {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  width?: "default" | "narrow" | "wide";
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cx(
        !/\bpy-/.test(className ?? "") && "py-20 sm:py-28",
        className,
      )}
    >
      <Container width={width}>
        {(eyebrow || title || description || action) && (
          <div className="mb-8 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between md:gap-6">
            <div className="max-w-2xl">
              {eyebrow ? <p className="eyebrow text-stone">{eyebrow}</p> : null}
              {title ? (
                <h2 className="display mt-3 text-4xl text-navy sm:text-5xl">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-4 max-w-xl text-base leading-7 text-stone sm:text-lg">
                  {description}
                </p>
              ) : null}
            </div>
            {action}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
