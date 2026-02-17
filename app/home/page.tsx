import Navbar from "../components/home/Navbar";
import SandwichScroll from "../components/home/SandwichScroll";
import MenuSection from "../components/home/MenuSection";
import TestimonialSection from "../components/home/Testimonial";
import Footer from "../components/home/Footer";
import { Playfair_Display, Poppins } from "next/font/google";

const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  style: ["italic", "normal"],
});
const sans = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function Home() {
  return (
    <main className={`${sans.className} bg-[#E8E1CF] antialiased`}>
      {/* GLOBAL NAVIGATION */}
      <Navbar />

      {/* HERO SECTION: SANDWICH SCROLL */}
      <section className="relative">
        <SandwichScroll />

        <div className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center z-20">
          <div className="text-center"></div>
        </div>
      </section>

     
      <MenuSection />
      <TestimonialSection />
      <Footer /> 
      {/* FOOTER */}
      
    </main>
  );
}
