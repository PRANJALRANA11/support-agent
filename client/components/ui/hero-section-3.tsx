"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUp, Globe, Plus, Sparkle } from "lucide-react";
import Image from "next/image";
import VideoPlayer from "./video-player";
import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function HeroSection() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "support-agent-demo" });
      cal("ui", {
        cssVarsPerTheme: {
          light: { "cal-brand": "#2b83ff" },
          dark: { "cal-brand": "#2b83ff" },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);
  return (
    <>
      <main className="[--color-primary:var(--color-indigo-500)]">
        <section className="overflow-hidden">
          <div className="py-20 md:py-36">
            <div className="relative z-10 mx-auto max-w-5xl px-6">
              <div className="relative text-center">
                <h1 className="mx-auto max-w-2xl text-balance text-4xl font-bold md:text-5xl">
                  Build Smarter Support That Solves Faster
                </h1>

                <p className="text-muted-foreground mx-auto my-6 max-w-2xl text-balance text-xl">
                  AI Support System For Devtools Companies
                </p>

                <div className="flex flex-col items-center justify-center gap-3 *:w-full sm:flex-row sm:*:w-auto">
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      <span className="text-nowrap">Get Started</span>
                    </Link>
                  </Button>
                  <Button key={2} asChild size="lg" variant="outline">
                    <Link href="#link">
                      <span
                        className="text-nowrap"
                        data-cal-namespace="support-agent-demo"
                        data-cal-link="pranjal-rana-bhoyu7/support-agent-demo"
                        data-cal-config='{"layout":"month_view","theme":"auto"}'
                      >
                        Book A Demo Call
                      </span>
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-3xl bg-black/10 md:mt-20">
                <img
                  src="https://images.unsplash.com/photo-1637055972140-64608c1abe53?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />

                <div className=" relative m-4 overflow-hidden shadow-xl shadow-black/15 ring-1 ring-black/10 sm:m-8 md:m-12">
                  <VideoPlayer src="https://videos.pexels.com/video-files/30333849/13003128_2560_1440_25fps.mp4" />
                </div>
              </div>

              {/* <div className="mt-8">
                <p className="text-muted-foreground text-center">
                  Trusted by teams at :
                </p>
                <div className="mt-4 flex items-center justify-center gap-12">
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit"
                      src="https://html.tailus.io/blocks/customers/nvidia.svg"
                      alt="Nvidia Logo"
                      height="20"
                      width="auto"
                    />
                  </div>

                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit"
                      src="https://html.tailus.io/blocks/customers/column.svg"
                      alt="Column Logo"
                      height="16"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit"
                      src="https://html.tailus.io/blocks/customers/github.svg"
                      alt="GitHub Logo"
                      height="16"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit"
                      src="https://html.tailus.io/blocks/customers/nike.svg"
                      alt="Nike Logo"
                      height="20"
                      width="auto"
                    />
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
