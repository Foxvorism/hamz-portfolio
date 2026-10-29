<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { experience, profile, projects } from "~/data/portfolio";

const heroSection = ref<HTMLElement | null>(null);
const portraitFrame = ref<HTMLElement | null>(null);
const portraitImage = ref<HTMLImageElement | null>(null);
const heroRole = ref<HTMLElement | null>(null);
const marquee = ref<HTMLElement | null>(null);
const marqueeProgress = ref(0);
const glassOpacity = ref(0);
const fluidTransition = ref(0);
const paletteProgress = { value: 0 };
const menuOpen = ref(false);
const menuTrigger = ref<HTMLButtonElement | null>(null);
const firstMenuLink = ref<HTMLAnchorElement | null>(null);
const pointer = reactive({ x: 50, y: 43, active: false });
const cursorInteractionEnabled = false;
let revertHeroMotion: (() => void) | undefined;

function trackPointer(event: PointerEvent) {
  if (
    !cursorInteractionEnabled ||
    event.pointerType !== "mouse" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 100;
  pointer.y = ((event.clientY - bounds.top) / bounds.height) * 100;
  pointer.active = true;
}

function resetPointer() {
  pointer.x = 50;
  pointer.y = 43;
  pointer.active = false;
}

async function toggleMenu() {
  menuOpen.value = !menuOpen.value;
  if (menuOpen.value) {
    await nextTick();
    firstMenuLink.value?.focus();
  }
}

function closeMenu(restoreFocus = false) {
  menuOpen.value = false;
  if (restoreFocus) menuTrigger.value?.focus();
}

function handleEscape() {
  if (menuOpen.value) closeMenu(true);
}

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);
  const context = gsap.context(() => {
    const frame = portraitFrame.value;
    if (!frame) return;

    gsap.set(frame, {
      width: "100vw",
      height: "100svh",
      top: 0,
      bottom: "auto",
      xPercent: -50,
      yPercent: 0,
      scaleX: 1,
      scaleY: 1,
      borderColor: "transparent",
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection.value,
        start: "top top",
        end: "+=250%",
        scrub: 0.8,
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        onUpdate: (self) => {
          const revealStart = 0.34;
          const revealEnd = 0.46;
          const reveal = Math.max(0, Math.min((self.progress - revealStart) / (revealEnd - revealStart), 1));
          glassOpacity.value = Math.min(self.progress / 0.34, 1);
          marqueeProgress.value = reveal;
          gsap.set(marquee.value, {
            autoAlpha: reveal > 0 ? 1 : 0,
            clipPath: `inset(0 ${50 * (1 - reveal)}% 0 ${50 * (1 - reveal)}%)`,
          });
          gsap.set(frame, {
            top: self.progress > 0.001 ? "50%" : 0,
            yPercent: self.progress > 0.001 ? -50 : 0,
            borderColor: self.progress > 0.001 ? "rgba(190, 150, 255, 0.42)" : "transparent",
          });
        },
      },
    });

    timeline
      .to(paletteProgress, {
        value: 1,
        duration: 1,
        onUpdate: () => { fluidTransition.value = paletteProgress.value; },
      }, 0)
      .to(frame, { scaleX: 0.34, scaleY: 0.46, duration: 1 }, 0)
      .to(portraitImage.value, { scaleX: 1.15 * 0.46 / 0.34, scaleY: 1.15, duration: 1 }, 0)
      .to(".hero-portrait-tint", { scaleX: 1.15 * 0.46 / 0.34, scaleY: 1.15, duration: 1 }, 0)
      .to(heroRole.value, { opacity: 0, y: 18, duration: 0.25 }, 0)
      .to(".hero-selected-work", { opacity: 0, duration: 0.2 }, 0)
      .to({}, { duration: 2 / 3 });
  }, heroSection.value!);

  revertHeroMotion = () => context.revert();
});

onBeforeUnmount(() => revertHeroMotion?.());

useSeoMeta({
  title: "Irham Maulana Johani | Portfolio",
  description: "Selected projects and experience from Irham Maulana Johani.",
});
</script>

<template>
  <main id="top">
    <section
      ref="heroSection"
      class="relative isolate h-svh w-full overflow-hidden bg-black text-portfolio-text"
      aria-label="Introduction"
      @keydown.esc.stop.prevent="handleEscape"
      @pointermove="trackPointer"
      @pointerleave="resetPointer"
    >
      <HeroFluidBackground
        :enabled="true"
        :pointer-x="pointer.x"
        :pointer-y="pointer.y"
        :active="pointer.active"
        :transition="fluidTransition"
      />

      <div
        ref="marquee"
        class="hero-marquee"
        :class="{ 'is-moving': marqueeProgress > 0 }"
        aria-hidden="true"
      >
        <div class="hero-marquee__row hero-marquee__row--forward">
          <div class="hero-marquee__track">
            <span>LOREM IPSUM DOLOR SIT AMET <i>✳</i>&nbsp;</span>
            <span>LOREM IPSUM DOLOR SIT AMET <i>✳</i>&nbsp;</span>
          </div>
        </div>
        <div class="hero-marquee__row hero-marquee__row--reverse">
          <div class="hero-marquee__track">
            <span>CONSECTETUR ADIPISCING ELIT <i>✳</i>&nbsp;</span>
            <span>CONSECTETUR ADIPISCING ELIT <i>✳</i>&nbsp;</span>
          </div>
        </div>
      </div>

      <div
        ref="portraitFrame"
        class="hero-portrait-frame"
        :class="{ 'is-glass': glassOpacity > 0.001 }"
        :style="{
          '--glass-lavender-alpha': (glassOpacity * 0.72).toFixed(3),
          '--glass-purple-alpha': (glassOpacity * 0.78).toFixed(3),
          '--glass-edge-alpha': (glassOpacity * 0.24).toFixed(3),
          '--glass-shadow-alpha': (glassOpacity * 0.18).toFixed(3),
          '--glass-blur': `${glassOpacity * 26}px`,
        }"
      >
        <img
          ref="portraitImage"
          src="/assets/images/portrait_pic_cl.webp"
          alt="Temporary portrait placeholder"
          draggable="false"
          @dragstart.prevent
          fetchpriority="high"
          decoding="async"
          :style="{
            filter: `grayscale(${fluidTransition}) brightness(${1 + fluidTransition * 0.08}) contrast(${1 - fluidTransition * 0.12})`,
          }"
        />
        <span
          class="hero-portrait-tint"
          aria-hidden="true"
          :style="{
            opacity: fluidTransition * 0.9,
          }"
        ></span>
      </div>

      <h1
        class="absolute left-[clamp(1.5rem,4vw,4rem)] top-[clamp(1.5rem,4vh,3rem)] z-3 m-0 grid max-w-[min(42vw,34rem)] font-portfolio-display text-[clamp(1.45rem,2.65vw,2.65rem)] font-bold leading-[0.98] tracking-[-0.06em] text-portfolio-text max-[700px]:left-6 max-[700px]:top-21 max-[700px]:max-w-[66vw] max-[700px]:text-[clamp(1.1rem,5.7vw,1.6rem)]"
      >
        <span>Irham M.</span><span>Johani</span>
      </h1>
      <NuxtLink
        class="wordmark absolute left-1/2 top-[clamp(1.35rem,3.5vh,2.5rem)] z-2 -translate-x-1/2 font-portfolio-display text-[clamp(1.8rem,2.5vw,2.6rem)] leading-none max-[700px]:top-6 max-[700px]:text-2xl"
        to="/"
        aria-label="IMJ, home"
        >IMJ<span>•</span></NuxtLink
      >

      <button
        ref="menuTrigger"
        class="absolute right-[clamp(1.5rem,4vw,4rem)] top-[clamp(1rem,3vh,2rem)] z-4 grid size-14.5 place-items-center rounded-sm border-2 border-white/50 bg-black text-portfolio-text transition-colors hover:border-portfolio-violet focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-portfolio-violet max-[700px]:right-6 max-[700px]:top-4 max-[700px]:size-12"
        type="button"
        aria-controls="home-navigation"
        :aria-expanded="menuOpen"
        :aria-label="menuOpen ? 'Close navigation' : 'Open navigation'"
        @click="toggleMenu"
      >
        <span
          class="grid w-5.5 gap-1.75"
          :class="{ 'is-open': menuOpen }"
          aria-hidden="true"
          ><span
            class="block h-0.5 w-5.5 bg-current transition-transform duration-200"
            :class="{ 'translate-y-[4.5px] rotate-45': menuOpen }"
          ></span
          ><span
            class="block h-0.5 w-5.5 bg-current transition-transform duration-200"
            :class="{ 'translate-y-[-4.5px] -rotate-45': menuOpen }"
          ></span
        ></span>
      </button>

      <nav
        id="home-navigation"
        v-show="menuOpen"
        class="absolute right-[clamp(1.5rem,4vw,4rem)] top-[clamp(5.5rem,12vh,7.5rem)] z-3 grid w-[min(320px,calc(100vw-3rem))] border border-white/15 bg-[#13111b] p-5 font-portfolio-text max-[700px]:right-6 max-[700px]:top-19"
        aria-label="Main navigation"
      >
        <a
          class="px-2 py-3 text-base text-white/70 transition-colors hover:text-portfolio-violet focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-portfolio-violet"
          ref="firstMenuLink"
          href="#work"
          @click="closeMenu(false)"
          >Selected work</a
        >
        <a
          class="px-2 py-3 text-base text-white/70 transition-colors hover:text-portfolio-violet focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-portfolio-violet"
          href="#experience"
          @click="closeMenu(false)"
          >Experience</a
        >
        <a
          class="px-2 py-3 text-base text-white/70 transition-colors hover:text-portfolio-violet focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-portfolio-violet"
          href="#about"
          @click="closeMenu(false)"
          >About</a
        >
        <a
          class="px-2 py-3 text-base text-white/70 transition-colors hover:text-portfolio-violet focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-portfolio-violet"
          href="#contact"
          @click="closeMenu(false)"
          >Contact</a
        >
      </nav>

      <p
        ref="heroRole"
        class="absolute bottom-[clamp(1.5rem,4vh,3rem)] left-[clamp(1.5rem,4vw,4rem)] z-3 m-0 font-portfolio-text text-[clamp(1rem,1.35vw,1.25rem)] font-medium max-[700px]:bottom-[max(1.5rem,env(safe-area-inset-bottom))] max-[700px]:left-6 max-[700px]:text-sm"
      >
        Frontend Developer
      </p>
      <a
        class="hero-selected-work absolute bottom-[clamp(1.5rem,4vh,3rem)] right-[clamp(1.5rem,4vw,4rem)] z-3 font-portfolio-text text-[0.95rem] text-white/70 underline decoration-portfolio-purple underline-offset-[5px] hover:text-portfolio-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-portfolio-violet max-[700px]:right-6 max-[700px]:bottom-[max(1.5rem,env(safe-area-inset-bottom))] max-[700px]:text-sm"
        href="#work"
        >Selected work</a
      >
    </section>

    <section id="work" class="section-wrap section-block work-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Selected work <span>— 01 / 02</span></p>
          <h2>Built to solve<br /><span>real problems.</span></h2>
        </div>
        <p class="section-heading__aside">
          Two projects to start with.<br />Case study details will be verified
          before publication.
        </p>
      </div>
      <div class="project-grid">
        <ProjectCard
          v-for="project in projects"
          :key="project.slug"
          :project="project"
        />
      </div>
    </section>

    <ExperienceTimeline :items="experience" />

    <section id="about" class="section-wrap about-section">
      <p class="eyebrow">A little about me <span>— 03 / 04</span></p>
      <div class="about-section__content">
        <h2>Curiosity, then<br /><span>craft.</span></h2>
        <div>
          <p>{{ profile.bio }}</p>
          <p class="placeholder-note">
            Bio, confirmed skills, and location are placeholders until reviewed.
          </p>
        </div>
      </div>
      <div class="about-section__visual media-placeholder">
        <span>Workspace / portrait detail image · placeholder</span
        ><span class="media-placeholder__orb" aria-hidden="true"></span>
      </div>
    </section>

    <section id="contact" class="section-wrap contact-section">
      <p class="eyebrow">Contact <span>— 04 / 04</span></p>
      <h2>Have a good<br /><span>project in mind?</span></h2>
      <p>Contact details will be added after verification.</p>
      <div class="contact-links">
        <span>{{ profile.email }}</span
        ><span>{{ profile.linkedin }}</span>
      </div>
      <span class="contact-section__location">{{ profile.location }}</span>
    </section>
  </main>
</template>

<style scoped>
.hero-portrait-frame {
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 50%;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid transparent;
  transform: translateX(-50%);
  will-change: transform;
}

#work.work-section {
  width: 100vw;
  max-width: none;
  margin-left: calc(50% - 50vw);
  padding-inline: max(1rem, calc((100vw - var(--content-width)) / 2));
  position: relative;
  z-index: 3;
  margin-top: 150svh;
  background: var(--color-bg);
}

.hero-portrait-frame.is-glass {
  border-color: rgb(220 195 255 / var(--glass-edge-alpha));
  background: linear-gradient(135deg, rgb(197 165 255 / var(--glass-lavender-alpha)), rgb(109 58 226 / var(--glass-purple-alpha)));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / var(--glass-edge-alpha)), 0 16px 70px rgb(6 2 12 / var(--glass-shadow-alpha));
}

.hero-portrait-frame img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  transform-origin: center bottom;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.hero-portrait-tint {
  position: absolute;
  z-index: 2;
  inset: 0;
  background: #c5a5ff;
  mix-blend-mode: color;
  mask-image: url("/assets/images/portrait_pic_cl.webp");
  mask-position: center bottom;
  mask-repeat: no-repeat;
  mask-size: contain;
  transform-origin: center bottom;
  pointer-events: none;
  -webkit-mask-image: url("/assets/images/portrait_pic_cl.webp");
  -webkit-mask-position: center bottom;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
}

.hero-marquee {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 0;
  display: grid;
  width: 100%;
  gap: 0.6rem;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-50%);
}

.hero-marquee__row {
  overflow: hidden;
  color: var(--color-text);
  font-family: var(--font-hero-display);
  font-size: clamp(2.8rem, 6.5vw, 6rem);
  font-weight: 750;
  letter-spacing: -0.075em;
  line-height: 0.9;
  white-space: nowrap;
}

.hero-marquee__row--reverse { color: var(--color-violet); }
.hero-marquee__row i { color: #d8c7ff; font-size: 0.62em; font-style: normal; }
.hero-marquee__track { display: flex; width: max-content; animation: marquee-forward 30s linear infinite; animation-play-state: paused; }
.hero-marquee__row--reverse .hero-marquee__track { animation-name: marquee-reverse; animation-duration: 36s; }
.hero-marquee.is-moving .hero-marquee__track { animation-play-state: running; }

@keyframes marquee-forward { to { transform: translateX(-50%); } }
@keyframes marquee-reverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }

@media (max-width: 700px) {
  .hero-marquee__row { font-size: clamp(2.4rem, 9vw, 4.5rem); }
}

@media (prefers-reduced-motion: reduce) {
  .hero-marquee { opacity: 1; clip-path: none !important; }
  .hero-marquee__track { animation: none; }
  .hero-portrait-frame { will-change: auto; }
  #work.work-section { margin-top: 0; }
}

</style>
