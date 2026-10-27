<script setup lang="ts">
import { projects } from '~/data/portfolio'

const route = useRoute()
const project = computed(() => projects.find((item) => item.slug === route.params.slug))

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

useSeoMeta({
  title: () => `${project.value?.title ?? 'Project'} — Irham Maulana Johani`,
  description: () => project.value?.summary ?? 'Project details.'
})
</script>

<template>
  <main v-if="project" id="top" class="project-detail section-wrap">
    <NuxtLink class="back-link" to="/#work">← Back to selected work</NuxtLink>
    <p class="eyebrow">Case study <span>— {{ project.number }}</span></p>
    <div class="project-detail__heading"><div><p class="project-detail__category">{{ project.category }}</p><h1>{{ project.title }}</h1></div><p>{{ project.summary }}</p></div>
    <div class="media-placeholder project-detail__media"><span>Project image placeholder</span><span class="media-placeholder__orb" aria-hidden="true"></span><small>{{ project.mediaNote }}</small></div>
    <div class="project-detail__body">
      <section><p class="eyebrow">Overview</p><h2>Context</h2><p>{{ project.context }}</p></section>
      <section><p class="eyebrow">Contribution</p><h2>Role</h2><p>{{ project.role }}</p></section>
      <section><p class="eyebrow">Tools</p><h2>Stack</h2><p v-if="project.stack.length" class="tag-list"><span v-for="tool in project.stack" :key="tool">{{ tool }}</span></p><p v-else>Stack to confirm.</p></section>
      <section><p class="eyebrow">Open items</p><h2>{{ project.status }}</h2><p>Problem details, process, decisions, measurable outcomes, and approved media will be added when confirmed.</p></section>
    </div>
    <NuxtLink class="next-project" :to="`/projects/${projects[(projects.findIndex((item) => item.slug === project.slug) + 1) % projects.length]!.slug}`">Next project <span>↗</span></NuxtLink>
  </main>
</template>
