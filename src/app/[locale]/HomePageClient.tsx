"use client";

import { Suspense, lazy, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
// import { SidebarAd } from "@/components/ads/SidebarAd";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Conditionally render text as a link or plain span.
// 内部内容链接已移除，linkData 通常为 null，渲染为纯文本标题。
function LinkedTitle({
  linkData,
  children,
  className,
  locale,
}: {
  linkData: { url: string; title: string } | null | undefined;
  children: React.ReactNode;
  className?: string;
  locale: string;
}) {
  if (linkData) {
    const href = locale === "en" ? linkData.url : `/${locale}${linkData.url}`;
    return (
      <Link
        href={href}
        className={`${className || ""} hover:text-[hsl(var(--nav-theme-light))] hover:underline decoration-[hsl(var(--nav-theme-light))/0.4] underline-offset-4 transition-colors`}
        title={linkData.title}
      >
        {children}
      </Link>
    );
  }
  return <>{children}</>;
}

// 可折叠的 accordion 条目（用于 Fishing Guide 模块）
// 使用 CSS grid-rows 动画实现平滑展开，无需 maxHeight
function FishingAccordionItem({
  item,
  defaultOpen = false,
}: {
  item: { icon: string; question: string; answer: string };
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white/5 hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 md:p-5 text-left"
        aria-expanded={open}
      >
        <div className="h-9 w-9 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center flex-shrink-0">
          <DynamicIcon
            name={item.icon}
            className="h-4 w-4 text-[hsl(var(--nav-theme-light))]"
          />
        </div>
        <h3 className="flex-1 font-bold text-sm md:text-base">{item.question}</h3>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="px-4 md:px-5 pb-4 md:pb-5 pl-16 md:pl-[4.25rem] text-sm md:text-base text-muted-foreground">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

// Tools Grid 导航卡片 -> section 锚点映射（与下方模块 id 一一对应）
const TOOL_SECTION_IDS = [
  "release-date-and-play-link",
  "codes",
  "beginner-guide",
  "seeds-and-crops-tier-list",
  "pets-guide",
  "fishing-guide",
  "gear-shop-tools-guide",
  "houses-decorations-guide",
];

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.gardenquest.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Garden Quest Wiki",
        description:
          "Garden Quest Wiki tracks the upcoming Roblox farming adventure — codes, crops, quests, pets, fishing, gear, release date, and beginner tips for launch.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Garden Quest - Roblox Farming Adventure",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Garden Quest Wiki",
        alternateName: "Garden Quest",
        url: siteUrl,
        description:
          "Garden Quest Wiki resource hub for codes, crops, quests, pets, fishing, gear, and beginner guides for the upcoming Roblox farming adventure",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Garden Quest Wiki - Roblox Farming Adventure",
        },
        sameAs: [
          "https://www.roblox.com/share/g/124192767",
          "https://discord.gg/gardenquest",
          "https://www.reddit.com/r/GardenQuest/",
          "https://www.youtube.com/@GardenQuestStudio",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Garden Quest",
        gamePlatform: ["Roblox", "PC", "Mobile"],
        applicationCategory: "Game",
        genre: ["Farming", "Adventure", "Simulation", "Casual"],
        numberOfPlayers: {
          minValue: 1,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/PreOrder",
          url: "https://www.roblox.com/share/g/124192767",
        },
      },
      {
        "@type": "VideoObject",
        name: "Garden Quest Official Trailer | Gameplay and Release Date",
        description:
          "Official Garden Quest trailer featuring Roblox farming gameplay and the June 27 release date.",
        uploadDate: "2026-06-22",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/GMZc0ad8TKE",
        url: "https://www.youtube.com/watch?v=GMZc0ad8TKE",
      },
    ],
  };

  const mobileBannerAd = getPreferredMobileBannerSelection();

  const releaseItems = (t.modules?.gardenQuestReleaseAndPlayLink?.items ||
    []) as any[];
  const codeSections = (t.modules?.gardenQuestCodes?.sections || []) as any[];
  const beginnerSteps = (t.modules?.gardenQuestBeginnerGuide?.steps ||
    []) as any[];
  const beginnerTips = (t.modules?.gardenQuestBeginnerGuide?.quickTips ||
    []) as string[];
  const cropTiers = (t.modules?.gardenQuestSeedsAndCrops?.tiers || []) as any[];

  const codeEmptySections = codeSections.filter((s) => s.emptyText);
  const codeSourcesSection = codeSections.find((s) => s.sources);
  const codeTipsSection = codeSections.find((s) => s.tips);

  // 模块 5-8 数据提取
  const petItems = (t.modules?.gardenQuestPetsGuide?.items || []) as any[];
  const fishingItems =
    (t.modules?.gardenQuestFishingGuide?.items || []) as any[];
  const gearItems =
    (t.modules?.gardenQuestGearShopAndTools?.items || []) as any[];
  const houseItems =
    (t.modules?.gardenQuestHousesAndDecorations?.items || []) as any[];

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("beginner-guide")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/share/g/124192767"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero 之后（max-w-5xl，避免挤压广告位） */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="GMZc0ad8TKE"
              title="Garden Quest Official Trailer | Gameplay and Release Date"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（位于视频区之后、Latest Updates 之前） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = TOOL_SECTION_IDS[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Release Date and Official Play Links (info-cards) */}
      <section
        id="release-date-and-play-link"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["gardenQuestReleaseAndPlayLink"]}
                locale={locale}
              >
                {t.modules.gardenQuestReleaseAndPlayLink.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gardenQuestReleaseAndPlayLink.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {releaseItems.map((item: any, index: number) => (
              <div
                key={index}
                className="flex flex-col p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center flex-shrink-0">
                    <DynamicIcon
                      name={item.icon}
                      className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                    {item.label}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-[hsl(var(--nav-theme-light))]">
                  {item.value}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {item.description}
                </p>
                {item.href && (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--nav-theme-light))] hover:underline mt-auto"
                  >
                    Open Link
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Codes (code-cards) */}
      <section
        id="codes"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["gardenQuestCodes"]}
                locale={locale}
              >
                {t.modules.gardenQuestCodes.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gardenQuestCodes.intro}
            </p>
          </div>

          {/* Active / Expired empty states */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {codeEmptySections.map((section: any, index: number) => (
              <div
                key={index}
                className="p-5 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <DynamicIcon
                    name="Ticket"
                    className="h-4 w-4 text-[hsl(var(--nav-theme-light))]"
                  />
                  <h3 className="font-bold">{section.heading}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {section.emptyText}
                </p>
              </div>
            ))}
          </div>

          {/* Official Code Sources */}
          {codeSourcesSection && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <DynamicIcon
                  name="Gift"
                  className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                />
                {codeSourcesSection.heading}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {codeSourcesSection.sources.map((src: any, i: number) => (
                  <a
                    key={i}
                    href={src.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-9 w-9 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center flex-shrink-0">
                        <DynamicIcon
                          name={src.icon}
                          className="h-4 w-4 text-[hsl(var(--nav-theme-light))]"
                        />
                      </div>
                      <span className="font-bold flex-1">{src.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {src.description}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Code Use Rules */}
          {codeTipsSection && (
            <div className="p-5 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <BookOpen className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                <h3 className="font-bold text-base md:text-lg">
                  {codeTipsSection.heading}
                </h3>
              </div>
              <ul className="space-y-2">
                {codeTipsSection.tips.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Module 3: Beginner Guide (step-by-step) */}
      <section
        id="beginner-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["gardenQuestBeginnerGuide"]}
                locale={locale}
              >
                {t.modules.gardenQuestBeginnerGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gardenQuestBeginnerGuide.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
            {beginnerSteps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                  <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-2">
                    {step.description}
                  </p>
                  {step.href && (
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--nav-theme-light))] hover:underline"
                    >
                      Watch Preview
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          {beginnerTips.length > 0 && (
            <div className="scroll-reveal p-4 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <BookOpen className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                <h3 className="font-bold text-base md:text-lg">Quick Tips</h3>
              </div>
              <ul className="space-y-2">
                {beginnerTips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* 广告位 5: 模块之间的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 4: Seeds and Crops Tier List (tier-grid) */}
      <section
        id="seeds-and-crops-tier-list"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["gardenQuestSeedsAndCrops"]}
                locale={locale}
              >
                {t.modules.gardenQuestSeedsAndCrops.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gardenQuestSeedsAndCrops.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-6">
            {cropTiers.map((tier: any, ti: number) => (
              <div
                key={ti}
                className="p-5 md:p-6 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      ti === 0
                        ? "bg-[hsl(var(--nav-theme)/0.15)] border-[hsl(var(--nav-theme)/0.4)] text-[hsl(var(--nav-theme-light))]"
                        : "bg-[hsl(var(--nav-theme)/0.08)] border-[hsl(var(--nav-theme)/0.25)]"
                    }`}
                  >
                    {tier.tier}
                  </span>
                  <h3 className="font-bold text-base md:text-lg">{tier.label}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {tier.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tier.crops.map((crop: any, ci: number) => (
                    <div
                      key={ci}
                      className="p-4 md:p-5 bg-white/5 border border-border rounded-lg hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <DynamicIcon
                          name={ci === 0 && ti === 0 ? "Carrot" : "Sprout"}
                          className="h-4 w-4 text-[hsl(var(--nav-theme-light))] flex-shrink-0"
                        />
                        <h4 className="font-bold text-sm md:text-base flex-1">
                          {crop.name}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                          {crop.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground italic mb-2">
                        {crop.preview}
                      </p>
                      <p className="text-sm mb-3">{crop.use}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {crop.stats.map((stat: string, si: number) => (
                          <span
                            key={si}
                            className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-border text-muted-foreground"
                          >
                            {stat}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 320×50 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 5: Pets Guide (card-list) */}
      <section
        id="pets-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["gardenQuestPetsGuide"]}
                locale={locale}
              >
                {t.modules.gardenQuestPetsGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gardenQuestPetsGuide.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {petItems.map((pet: any, index: number) => (
              <div
                key={index}
                className="flex flex-col p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center flex-shrink-0">
                    <DynamicIcon
                      name={pet.icon}
                      className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-[hsl(var(--nav-theme-light))] truncate">
                      {pet.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {pet.category}
                    </span>
                  </div>
                </div>
                <span className="self-start text-xs px-2 py-1 mb-3 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                  {pet.role}
                </span>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {pet.detail}
                </p>
                <div className="flex items-start gap-2 pt-3 border-t border-border">
                  <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{pet.player_use}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 7: 模块之间的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 6: Fishing Guide (accordion) */}
      <section
        id="fishing-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["gardenQuestFishingGuide"]}
                locale={locale}
              >
                {t.modules.gardenQuestFishingGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gardenQuestFishingGuide.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-3 max-w-3xl mx-auto">
            {fishingItems.map((item: any, index: number) => (
              <FishingAccordionItem
                key={index}
                item={item}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Module 7: Gear Shop and Tools Guide (table) */}
      <section
        id="gear-shop-tools-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["gardenQuestGearShopAndTools"]}
                locale={locale}
              >
                {t.modules.gardenQuestGearShopAndTools.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gardenQuestGearShopAndTools.intro}
            </p>
          </div>

          {/* 桌面端表格 */}
          <div className="scroll-reveal hidden md:block overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(var(--nav-theme)/0.1)]">
                <tr>
                  <th className="text-left p-4 font-semibold">Item</th>
                  <th className="text-left p-4 font-semibold">Category</th>
                  <th className="text-left p-4 font-semibold">Detail</th>
                  <th className="text-left p-4 font-semibold">Player Use</th>
                </tr>
              </thead>
              <tbody>
                {gearItems.map((gear: any, index: number) => (
                  <tr
                    key={index}
                    className="border-t border-border hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center flex-shrink-0">
                          <DynamicIcon
                            name={gear.icon}
                            className="h-4 w-4 text-[hsl(var(--nav-theme-light))]"
                          />
                        </div>
                        <span className="font-bold text-[hsl(var(--nav-theme-light))]">
                          {gear.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <span className="inline-block text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                        {gear.category}
                      </span>
                    </td>
                    <td className="p-4 align-top text-muted-foreground">
                      {gear.detail}
                    </td>
                    <td className="p-4 align-top text-muted-foreground">
                      {gear.player_use}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 移动端堆叠卡片 */}
          <div className="scroll-reveal md:hidden space-y-4">
            {gearItems.map((gear: any, index: number) => (
              <div
                key={index}
                className="p-5 bg-white/5 border border-border rounded-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center flex-shrink-0">
                    <DynamicIcon
                      name={gear.icon}
                      className="h-4 w-4 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="font-bold text-[hsl(var(--nav-theme-light))] flex-1">
                    {gear.name}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                    {gear.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{gear.detail}</p>
                <p className="text-sm">{gear.player_use}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 8: 模块之间的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 8: Houses and Decorations Guide (gallery-cards) */}
      <section
        id="houses-decorations-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["gardenQuestHousesAndDecorations"]}
                locale={locale}
              >
                {t.modules.gardenQuestHousesAndDecorations.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.gardenQuestHousesAndDecorations.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {houseItems.map((decor: any, index: number) => (
              <div
                key={index}
                className="flex flex-col p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center flex-shrink-0">
                    <DynamicIcon
                      name={decor.icon}
                      className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{decor.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {decor.category}
                    </span>
                  </div>
                </div>
                <span className="self-start text-xs px-2 py-1 mb-3 rounded-md bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-[hsl(var(--nav-theme-light))]">
                  {decor.visual_focus}
                </span>
                <p className="text-sm text-muted-foreground flex-1">
                  {decor.placement_idea}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Updates Section（保留，位于模块导航与模块内容之后） */}
      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={12} />

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.gg/gardenquest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@GardenQuestStudio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.reddit.com/r/GardenQuest/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.reddit}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/share/g/124192767"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxGroup}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
