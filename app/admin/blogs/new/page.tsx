"use client";

import BlogEditor from "@/editor/BlogEditor";

export default function NewBlogPage() {
  return <BlogEditor initial={{ slug: null, title: "", excerpt: "", tags: [], thumbnail: "", content: { type: "doc", content: [] }, published: false }} />;
}
