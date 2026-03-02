import Navbar from "../components/Navbar";
import Hero, {
  WhoItsFor,
  HowItWorks,
  FeaturesSection,
  Testimonials,
  CTASection,
  Footer,
} from "../components/Hero";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <WhoItsFor />
      <HowItWorks />
      <FeaturesSection />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}
