import { BlogPageClient } from "./BlogPageClient";

export const revalidate = 900; // 15 dakika ISR

export default function BlogPage() {
  return <BlogPageClient />;
}
