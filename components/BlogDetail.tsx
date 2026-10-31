'use client';

import React from 'react';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/constants';

const BlogDetail: React.FC<{ slug: string }> = ({ slug }) => {
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <h1 className="text-2xl font-black text-slate-800">پست یافت نشد</h1>
        <Link href="/blog" className="mt-4 inline-block text-orange-500 font-bold">بازگشت به لیست بلاگ</Link>
      </div>
    );
  }

  return (
    <article className="p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/blog" className="text-sm font-bold text-orange-500 hover:text-orange-600">← بازگشت به بلاگ</Link>
      <header>
        <time className="text-xs font-bold text-slate-400" dateTime={post.date}>{post.date}</time>
        <h1 className="text-3xl font-black text-slate-800 mt-2">{post.title}</h1>
        <h2 className="text-xl font-bold text-slate-600 mt-2">{post.subtitle}</h2>
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-black">
              {tag}
            </span>
          ))}
        </div>
      </header>
      <div className="rounded-2xl overflow-hidden border border-slate-100">
        <img src={post.image} alt={post.title} className="w-full h-64 object-cover" />
      </div>
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-700 font-bold leading-relaxed">{post.body}</p>
      </div>
    </article>
  );
};

export default BlogDetail;
