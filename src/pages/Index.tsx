import { Preloader } from "@/components/aasha/Preloader";
import { Navbar } from "@/components/aasha/Navbar";
import { Hero } from "@/components/aasha/Hero";
import { StatsBar } from "@/components/aasha/StatsBar";
import { Products } from "@/components/aasha/Products";
import { Testimonials } from "@/components/aasha/Testimonials";
import { YouTubeSection } from "@/components/aasha/YouTubeSection";
import { About, Contact } from "@/components/aasha/AboutContact";
import { Footer } from "@/components/aasha/Footer";
import { FloatingWhatsApp } from "@/components/aasha/FloatingWhatsApp";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Preloader />
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <Products />
        <Testimonials />
        <YouTubeSection />
        <About />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
