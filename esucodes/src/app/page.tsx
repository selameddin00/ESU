import { HeroSection } from "@/sections/HeroSection";
import { RecentPosts } from "@/sections/RecentPosts";
import { ProjectsTeaser } from "@/sections/ProjectsTeaser";
import { JoinCTA } from "@/sections/JoinCTA";

export const revalidate = 900; // 15 dakika ISR

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <RecentPosts />
      <ProjectsTeaser />
      <JoinCTA />
    </div>
  );
}
