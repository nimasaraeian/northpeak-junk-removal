import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBanner } from "@/components/content/CtaBanner";
import { PageHeader } from "@/components/content/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { blogPosts, getPost } from "@/content/blog";
import { getLocation } from "@/content/locations";
import { getService } from "@/content/services";
import { breadcrumbSchema } from "@/lib/schema";
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
      <PageHeader eyebrow={post.category} title={post.title} description={post.excerpt} />
      <article className="py-16">
        <Container width="narrow" className="space-y-6">
          {post.body.map((paragraph) => (
            <p key={paragraph} className="text-lg leading-8 text-navy/80">
              {paragraph}
            </p>
          ))}
          <div className="pt-8">
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
