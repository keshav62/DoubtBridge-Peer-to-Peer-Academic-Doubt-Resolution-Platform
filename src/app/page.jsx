import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import CommunitySection from '@/components/landing/CommunitySection';
import DashboardPreview from '@/components/landing/DashboardPreview';
import KnowledgeHubSection from '@/components/landing/KnowledgeHubSection';
import FinalCTA from '@/components/landing/FinalCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'DoubtBridge - Peer-to-Peer Academic Doubt Resolution Platform',
  description:
    'Never let a doubt stop your learning. Connect with knowledgeable classmates, discover clear explanations, and turn unanswered questions into opportunities to learn together.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#101B3D] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-700 antialiased overflow-x-hidden">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CommunitySection />
        <DashboardPreview />
        <KnowledgeHubSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
