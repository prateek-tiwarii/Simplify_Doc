"use client";
import Features from "@/components/landing/features";
import Hero from "@/components/landing/hero";
import { CardCarousel } from "@/components/ui/card-carousel";
import CTA from "@/components/ui/cta";
import Footer from "@/components/ui/footer";
import Navbar from "@/components/ui/navbar";
import SmokeyCursor from "@/components/ui/smokey-cursor";
import { TextScroll } from "@/components/ui/text-scroll";
import { Timeline } from "@/components/ui/timeline";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Home() {
  const images = [
    {
      src: "/test.jpg",
      alt: "/test.jpg",
      testimonial:
        "Obligence has drastically reduced our contract review time. The AI spots the details I care about before I even have to ask.",
    },
    {
      src: "/test.jpg",
      alt: "Image 1",
      testimonial:
        "As a non-lawyer, extracting obligations and deadlines from complex agreements used to take hours. Now, it’s minutes with Obligence.",
    },
    {
      src: "/test.jpg",
      alt: "Image 1",
      testimonial:
        "Our department manages hundreds of contracts a year. Obligence takes the guesswork out and brings peace of mind.",
    },
    {
      src: "/test.jpg",
      alt: "Image 1",
      testimonial:
        "Lease reviews have always been a bottleneck. Obligence’s clause extraction lets me close deals faster and protect our firm’s interests.",
    },
    {
      src: "/test.jpg",
      alt: "Image 1",
      testimonial:
        "It used to be daunting to review third-party agreements, but Obligence spotlights what matters and gives actionable summaries.",
    },
    {
      src: "/test.jpg",
      alt: "Image 1",
      testimonial:
        "From regulatory addenda to liability clauses, Obligence’s output is structured, clear, and always easy to audit.",
    },
    {
      src: "/test.jpg",
      alt: "Image 1",
      testimonial:
        "I love how quickly we can onboard new clients—Obligence automatically highlights IP and confidentiality points, saving our team countless hours.",
    },
    {
      src: "/test.jpg",
      alt: "Image 1",
      testimonial:
        "Now, I upload vendor and grant contracts and get an instant snapshot of obligations. Obligence helps our public office stay transparent and proactive.",
    },
  ];

  const data = [
    {
      title: "Step 1: Upload Your Document",
      content: (
        <div>
          <p className="mb-8 text-lg tracking-wide font-normal ">
            Drag and drop your contract or agreement as a PDF. Obligence accepts
            a variety of legal and business documents for instant processing.
          </p>
          <div className="grid grid-cols-1 w-full h-full gap-4">
            <DotLottieReact
              src="https://lottie.host/14b6bc14-5b90-4bfe-817d-9eff33972033/4A7HrFOdPz.lottie"
              loop
              autoplay
            />
          </div>
        </div>
      ),
    },
    {
      title: "Step 2: AI Analyzes Your Contract",
      content: (
        <div>
          <p className="mb-8 text-lg tracking-wide font-normal ">
            Our intelligent agent powered by Portia deeply scans the document,
            extracting key clauses, important dates, parties, and
            obligations—all in minutes.
          </p>
          <div className="grid grid-cols-1 w-full h-full gap-4">
            <DotLottieReact
              src="https://lottie.host/421a763f-afdd-458b-92cb-8b1ec436a7e3/LQY8DktRPJ.lottie"
              loop
              autoplay
            />
          </div>
        </div>
      ),
    },
    {
      title: "Step 3: Human Review (If Needed)",
      content: (
        <div>
          <p className="mb-8 text-lg tracking-wide font-normal ">
            If something in your contract is ambiguous or complex, Obligence
            automatically pauses and invites you to review flagged sections.
          </p>
          <div className="grid grid-cols-1 w-full h-full gap-4">
         <DotLottieReact
      src="https://lottie.host/997adb2c-e460-48a1-b855-45460fedd961/gjMX1UkJpI.lottie"
      loop
      autoplay
    />
          </div>
        </div>
      ),
    },
    {
      title: "Step 4: Receive Structured Insights",
      content: (
        <div>
          <p className="mb-8 text-lg tracking-wide font-normal ">
            Download, or explore your contract’s extracted data—fully
            structured, searchable, and ready for business action or legal
            compliance.
          </p>
          <div className="grid grid-cols-1 w-full h-full gap-4">
            <DotLottieReact
      src="https://lottie.host/5d87a429-7e16-4b9c-b717-be02700ce76b/QOlSnYHRYH.lottie"
      loop
      autoplay
    />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="font-sans ">
      <Navbar />
      <div className="space-y-20">
        <section id="hero">
          <Hero />
        </section>
        <section id="features">
          <Features />
        </section>
        <section id="solutions">
          <Timeline data={data} />
        </section>
        <TextScroll
          className="font-display text-center text-4xl font-semibold tracking-tighter md:text-7xl md:leading-[5rem]"
          text="Obligence is great"
          default_velocity={2}
        />
        <section id="testimonials">
          <CardCarousel
            images={images}
            autoplayDelay={2000}
            showPagination={true}
            showNavigation={true}
          />
        </section>
        {/* <Pricing /> */}
        <section id="pricing">
          <CTA />
        </section>
        <Footer />
      </div>
      <SmokeyCursor
        splatRadius={0.1}
        splatForce={3000}
        densityDissipation={8}
        velocityDissipation={5}
        colorUpdateSpeed={20}
        simulationResolution={64}
        dyeResolution={512}
        backgroundColor={{ r: 0.8, g: 0.1, b: 0 }}
      />
    </div>
  );
}
