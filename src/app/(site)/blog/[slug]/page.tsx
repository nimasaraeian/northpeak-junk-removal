import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogBody } from "@/components/content/BlogBody";
import { CtaBanner } from "@/components/content/CtaBanner";
import { FaqList } from "@/components/content/FaqList";
import { PageHeader } from "@/components/content/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { blogPosts, getPost } from "@/content/blog";
import { getLocation } from "@/content/locations";
import { getService } from "@/content/services";
import { heroShareImage } from "@/lib/blog/share-image";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.seoTitle,
    description: post.seoDescription,
    path: `/blog/${post.slug}`,
    image: post.heroImage ? heroShareImage(post.heroImage) : undefined,
  });
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Journal", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <JsonLd data={articleSchema(post)} />
      {post.faqs ? <JsonLd data={faqSchema(post.faqs)} /> : null}
      <PageHeader eyebrow={post.category} title={post.title} description={post.excerpt} />
      {post.heroImage ? (
        <div className="border-b border-navy/10 bg-navy">
          <Image
            src={post.heroImage.src}
            alt={post.heroImage.alt}
            width={post.heroImage.width}
            height={post.heroImage.height}
            // The LCP candidate on every post. Next 16 deprecated `priority`
            // in favour of `preload`, but the docs steer to eager + high
            // fetch priority when the image sits in the initial HTML, as this
            // one does — the preload scanner finds it without a <link>.
            loading="eager"
            fetchPriority="high"
            // Flat vector art: the optimizer has nothing to improve.
            unoptimized
            className="mx-auto h-auto w-full max-w-[1200px]"
          />
        </div>
      ) : null}
      <article className="py-14 sm:py-20">
        <Container width="narrow">
          <BlogBody blocks={post.body} />
          {post.faqs ? (
            <section className="mt-16">
              <h2 className="display text-[1.85rem] leading-tight text-navy sm:text-4xl">
                Frequently asked questions
              </h2>
              <div className="mt-6">
                <FaqList items={post.faqs} variant="cards" />
              </div>
            </section>
          ) : null}
          <div className="mt-16 border-t border-navy/10 pt-8">
            <p className="eyebrow text-stone">Keep reading</p>
            <ul className="mt-4 space-y-2 text-sm">
              {post.relatedServiceSlugs.map((item) => {
                const service = getService(item);
                return service ? (
                  <li key={item}>
                    <Link href={`/services/${service.slug}`} className="text-navy hover:underline">
                      {service.name}
                    </Link>
                  </li>
                ) : null;
              })}
              {post.relatedLocationSlugs.map((item) => {
                const location = getLocation(item);
                return location ? (
                  <li key={item}>
                    <Link href={`/locations/${location.slug}`} className="text-navy hover:underline">
                      Junk removal in {location.name}
                    </Link>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        </Container>
      </article>
      <CtaBanner />
    </>
  );
}
