<script setup lang="ts">
import { experience, profile, projects } from '~/data/portfolio'

useSeoMeta({
  title: 'Irham Maulana Johani — Portfolio',
  description: 'Selected projects and experience from Irham Maulana Johani.'
})
</script>

<template>
  <main id="top">
    <section class="hero section-wrap">
      <div class="hero__copy">
        <p class="eyebrow"><span class="eyebrow__dot"></span> Portfolio · Web development & digital products</p>
        <h1>{{ profile.name }}<br><span>Digital work,</span><br>made with intent.</h1>
        <p class="hero__intro">{{ profile.intro }} <span>Selected work and experience, in progress.</span></p>
        <div class="hero__actions">
          <a class="button button--primary" href="#work">Explore selected work <span>↓</span></a>
          <a class="text-link" href="#contact">Get in touch <span>↗</span></a>
        </div>
      </div>
      <div class="hero-visual media-placeholder" aria-label="Portrait or atmospheric hero photo placeholder">
        <div class="hero-visual__glow" aria-hidden="true"></div>
        <div class="hero-visual__frame" aria-hidden="true"></div>
        <div class="hero-visual__caption"><span>01 / VISUAL</span><span>Portrait or atmosphere photo · placeholder</span></div>
      </div>
      <div class="hero__index"><span>01</span><span class="index-line"></span><span>04</span></div>
    </section>

    <section id="work" class="section-wrap section-block">
      <div class="section-heading"><div><p class="eyebrow">Selected work <span>— 01 / 02</span></p><h2>Built to solve<br><span>real problems.</span></h2></div><p class="section-heading__aside">Two projects to start with.<br>Case study details will be verified before publication.</p></div>
      <div class="project-grid"><ProjectCard v-for="project in projects" :key="project.slug" :project="project" /></div>
    </section>

    <section id="experience" class="section-wrap section-block experience-section">
      <div class="section-heading"><div><p class="eyebrow">Experience <span>— 02 / 02</span></p><h2>People, teams<br><span>and practice.</span></h2></div><p class="section-heading__aside">Organizations and roles are known.<br>Dates and descriptions need verification.</p></div>
      <div class="experience-list"><article v-for="(item, index) in experience" :key="item.organization" class="experience-row"><span class="experience-row__number">0{{ index + 1 }}</span><div><h3>{{ item.role }}</h3><p>{{ item.organization }}</p></div><span class="experience-row__period">{{ item.period }}</span></article></div>
    </section>

    <section id="about" class="section-wrap about-section">
      <p class="eyebrow">A little about me <span>— 03 / 04</span></p>
      <div class="about-section__content"><h2>Curiosity, then<br><span>craft.</span></h2><div><p>{{ profile.bio }}</p><p class="placeholder-note">Bio, confirmed skills, and location are placeholders until reviewed.</p></div></div>
      <div class="about-section__visual media-placeholder"><span>Workspace / portrait detail image · placeholder</span><span class="media-placeholder__orb" aria-hidden="true"></span></div>
    </section>

    <section id="contact" class="section-wrap contact-section">
      <p class="eyebrow">Contact <span>— 04 / 04</span></p>
      <h2>Have a good<br><span>project in mind?</span></h2>
      <p>Contact details will be added after verification.</p>
      <div class="contact-links"><span>{{ profile.email }}</span><span>{{ profile.linkedin }}</span></div>
      <span class="contact-section__location">{{ profile.location }}</span>
    </section>
  </main>
</template>
