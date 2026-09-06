import Link from "next/link";
import { PageHeader } from "@/components/content/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { blogPosts } from "@/content/blog";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Junk Removal Journal",
  description:
    "Guides to junk removal, furniture removal, and garage cleanouts in North Vancouver and Greater Vancouver.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Journal", path: "/blog" },
        ])}
      />
      <PageHeader
        eyebrow="Journal"
        title="Useful writing for a city that is always clearing space."
        description="SEO content foundation. These pieces will later move into a CMS without changing the route structure."
      />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-5">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="rounded-[1.6rem] border border-navy/8 bg-white p-6 shadow-[var(--shadow-card)] md:p-8"
            >
              <p className="eyebrow text-gold-deep">
                {post.category} · {post.readingTime}
              </p>
              <h2 className="mt-3 text-3xl text-navy">{post.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone">{post.excerpt}</p>
            </Link>
          ))}
        </Container>
      </section>
    </>
  );
}
