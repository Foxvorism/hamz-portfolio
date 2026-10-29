<script setup lang="ts">
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

type TimelineItem = {
  kind: "work" | "education"
  role: string
  organization: string
  period: string
}

defineProps<{ items: TimelineItem[] }>()

const section = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const list = ref<HTMLOListElement | null>(null)
let horizontalScene: gsap.MatchMedia | undefined

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  horizontalScene = gsap.matchMedia()
  horizontalScene.add("(min-width: 761px) and (prefers-reduced-motion: no-preference)", () => {
    const sectionElement = section.value
    const trackElement = track.value
    const listElement = list.value
    if (!sectionElement || !trackElement || !listElement) return

    sectionElement.classList.add("is-scroll-scene")
    const getDistance = () => Math.max(0, listElement.scrollWidth - trackElement.clientWidth)
    const tween = gsap.to(listElement, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: sectionElement,
        start: "top top",
        end: () => `+=${getDistance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    })

    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => {
      sectionElement.classList.remove("is-scroll-scene")
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  })
})

onBeforeUnmount(() => horizontalScene?.revert())
</script>

<template>
  <section ref="section" id="experience" class="section-wrap section-block experience-section" aria-labelledby="experience-title">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Experience <span>/ 02</span></p>
        <h2 id="experience-title">People, teams<br /><span>and practice.</span></h2>
      </div>
      <p class="section-heading__aside">
        Scroll down to move across the timeline, or swipe on mobile.<br />Dates and education details need confirmation.
      </p>
    </div>

    <div ref="track" class="experience-track" tabindex="0" aria-label="Work experience and education timeline">
      <ol ref="list" class="experience-track__list">
        <li v-for="(item, index) in items" :key="`${item.kind}-${item.organization}`" class="experience-stop">
          <span class="experience-stop__marker" aria-hidden="true"></span>
          <article class="experience-stop__content">
            <div class="experience-stop__media" role="img" :aria-label="`Placeholder image for ${item.role}`">
              <span>Image placeholder</span>
            </div>
            <div class="experience-stop__details">
              <p class="experience-stop__kind">{{ item.kind === "work" ? "Work experience" : "Education" }} <span>0{{ index + 1 }}</span></p>
              <h3>{{ item.role }}</h3>
              <p class="experience-stop__organization">{{ item.organization }}</p>
              <p class="experience-stop__period">{{ item.period }}</p>
            </div>
          </article>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.experience-section {
  display: flex;
  min-height: 100svh;
  flex-direction: column;
  justify-content: center;
  width: 100vw;
  max-width: none;
  margin-inline: calc(50% - 50vw);
  padding-inline: 0;
  padding-block: clamp(3rem, 6vh, 5rem);
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 1.2%), transparent);
}

.experience-section .section-heading {
  width: min(calc(100% - 3rem), var(--content-width));
  margin-inline: auto;
}

.experience-track {
  position: relative;
  width: 100%;
  height: min(58svh, 520px);
  min-height: 420px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  scrollbar-color: var(--color-purple) transparent;
  scrollbar-width: thin;
  outline: none;
}

.experience-track::before {
  position: absolute;
  z-index: 0;
  top: 50%;
  right: 0;
  left: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--color-violet), rgb(168 117 255 / 55%), var(--color-violet));
  content: "";
  pointer-events: none;
}

.experience-section.is-scroll-scene .experience-track {
  overflow: hidden;
}

.experience-track:focus-visible {
  outline: 2px solid var(--color-violet);
  outline-offset: 6px;
}

.experience-track__list {
  position: relative;
  display: flex;
  width: max-content;
  min-width: 100%;
  height: 100%;
  gap: 0;
  margin: 0;
  padding: 0 5vw 0 max(5vw, calc((100vw - var(--content-width)) / 2));
  list-style: none;
}

.experience-stop {
  position: relative;
  z-index: 1;
  flex: 0 0 clamp(560px, 30vw, 620px);
  height: 100%;
}

.experience-stop__marker {
  position: absolute;
  top: 50%;
  left: 174px;
  width: 11px;
  height: 11px;
  border: 2px solid var(--color-violet);
  border-radius: 50%;
  background: var(--color-bg);
  transform: translateY(-50%);
}

.experience-stop__content {
  position: absolute;
  left: 0;
  display: grid;
  width: min(620px, calc(100vw - 3rem));
  grid-template-columns: 160px minmax(0, 1fr);
  align-items: start;
  gap: 1.5rem;
  padding: 0;
}

.experience-stop__media {
  display: grid;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid rgb(168 117 255 / 22%);
  background: radial-gradient(ellipse at 50% 55%, rgb(109 58 226 / 18%), transparent 68%), rgb(255 255 255 / 2%);
  color: var(--color-text-subtle);
  font-size: 0.68rem;
  text-align: center;
}

.experience-stop__media span { padding: 0.5rem; }
.experience-stop__details { min-width: 0; }

.experience-stop:nth-child(odd) .experience-stop__content {
  top: 0;
}

.experience-stop:nth-child(even) .experience-stop__content {
  bottom: 0;
}

.experience-stop::after {
  position: absolute;
  left: 179px;
  width: 1px;
  height: 28px;
  background: rgb(168 117 255 / 45%);
  content: "";
}

.experience-stop:nth-child(odd)::after {
  top: calc(50% - 28px);
}

.experience-stop:nth-child(even)::after {
  top: 50%;
}

.experience-stop__kind,
.experience-stop__period {
  color: var(--color-text-subtle);
  font-size: 0.7rem;
}

.experience-stop__kind {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.4rem;
  color: var(--color-violet);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.experience-stop__kind span { color: var(--color-text-subtle); }
.experience-stop h3 { max-width: 12em; margin: 0 0 0.5rem; font-size: clamp(1.5rem, 2.5vw, 2.2rem); font-weight: 550; letter-spacing: -0.055em; line-height: 1.05; }
.experience-stop__organization { margin: 0 0 0.9rem; color: var(--color-text-muted); }
.experience-stop__period { margin: 0; }

@media (max-width: 760px) {
  .experience-section { min-height: 0; padding-inline: 0; }
  .experience-track { height: 390px; min-height: 390px; }
  .experience-track__list { gap: 1rem; padding-inline: 1.5rem; }
  .experience-stop { flex-basis: min(86vw, 520px); }
  .experience-stop__marker { left: 0; }
  .experience-stop::after { left: 5px; }
  .experience-stop__content { width: calc(100vw - 3rem); grid-template-columns: 112px minmax(0, 1fr); gap: 1rem; }
  .experience-stop h3 { font-size: clamp(1.4rem, 6vw, 1.9rem); }
}

</style>
