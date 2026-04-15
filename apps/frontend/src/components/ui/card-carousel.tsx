"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { SparklesIcon, StarIcon } from "lucide-react";
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules";

interface CarouselProps {
  images: { src: string; alt: string; testimonial: string }[];
  autoplayDelay?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
}

export const CardCarousel: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  showPagination = true,
  showNavigation = true,
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 50px;
  }
  
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 300px;
    /* height: 300px; */
    /* margin: 20px; */
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
  }
  
  
  .swiper-3d .swiper-slide-shadow-left {
    background-image: none;
  }
  .swiper-3d .swiper-slide-shadow-right{
    background: none;
  }
  `;
  return (
    <section className="w-ace-y-4">
      <style>{css}</style>
      <div className="mx-auto w-full max-w-4xl rounded-2xl p-2 shadow-sm md:rounded-t-[44px]">
        <div className="relative mx-auto flex w-full flex-col rounded-[24px] border border-black/5  p-2 shadow-sm md:items-start md:gap-8 md:rounded-b-[20px] md:rounded-t-[40px] md:p-2">
          <div className="max-w-4xl mx-auto py-20 px-4 md:px-8 lg:px-10">
            <h2 className="text-lg md:text-7xl mb-4 max-w-4xl tracking-tighter text-balance ">
              Don't just take our word for it... <br />
              <span className="tracking-tighter text-balance text-transparent from-primary/10 via-foreground/85 to-foreground/50 bg-linear-to-tl bg-clip-text">
                See what others are saying!
              </span>
            </h2>
            <p className=" text-sm md:text-base max-w-sm">
              Discover why our users are absolutely raving about us! These are
              genuine experiences from real people who've unlocked the magic.
            </p>
          </div>

          <div className="flex w-full items-center justify-center gap-6">
            <div className="w-full">
              <Swiper
                spaceBetween={50}
                autoplay={{
                  delay: autoplayDelay,
                  disableOnInteraction: false,
                }}
                effect={"coverflow"}
                grabCursor={true}
                centeredSlides={true}
                loop={true}
                slidesPerView={"auto"}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 100,
                  modifier: 2.5,
                }}
                pagination={showPagination}
                navigation={
                  showNavigation
                    ? {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                      }
                    : undefined
                }
                modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
              >
                {images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="size-full py-10 space-y-4 px-4 backdrop-blur-md rounded-2xl border">
                      <div className="flex">
                        <StarIcon className=" h-4 w-4 text-yellow-300/80" />
                        <StarIcon className=" h-4 w-4 text-yellow-300/80" />
                        <StarIcon className=" h-4 w-4 text-yellow-300/80" />
                        <StarIcon className=" h-4 w-4 text-yellow-300/80" />
                        <StarIcon className=" h-4 w-4 text-yellow-300/80" />
                      </div>
                      <div className="backdrop-blur-sm italic font-light tracking-wider text-lg top-2 left-2 z-10 flex items-center gap-2">
                        "{image.testimonial}"
                      </div>
                      {/* <Image
                        src={image.src}
                        width={500}
                        height={500}
                        className="size-full rounded-xl"
                        alt={image.alt}
                      /> */}
                      <div className="bg-accent" />{" "}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
