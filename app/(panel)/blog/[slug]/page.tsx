import type { Metadata } from "next";
import BlogDetail from "@/components/BlogDetail";
import { BLOG_POSTS } from "@/lib/constants";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) {
    return { title: "پست یافت نشد | بلاگ کاسه" };
  }
  return {
    title: `${post.title} | بلاگ کاسه`,
    description: post.excerpt,
  };
}

export default async function BlogSlugPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogDetail slug={slug} />;
}
