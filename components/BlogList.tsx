'use client';

import React from 'react';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/constants';

const BlogList: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800">بلاگ کاسه</h1>
        <p className="text-slate-500 font-bold mt-1">مقالات و اخبار مجموعه غذایی کاسه؛ مناسب برای SEO و جستجو در گوگل</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BLOG_POSTS.map((post) => (
          <article key={post.id} className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="h-40 bg-slate-100 flex items-center justify-center text-4xl overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <time className="text-[10px] font-bold text-slate-400" dateTime={post.date}>{post.date}</time>
                <h2 className="text-lg font-black text-slate-800 mt-2 mb-2">{post.title}</h2>
                <p className="text-sm text-slate-500 font-bold line-clamp-2">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-black">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogList;
