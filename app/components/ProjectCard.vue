<script setup lang="ts">
import type { Project } from '~/data/portfolio'

defineProps<{ project: Project }>()
</script>

<template>
  <NuxtLink class="project-card" :to="`/projects/${project.slug}`">
    <div class="media-placeholder project-card__media" aria-label="Project image placeholder">
      <span class="media-placeholder__index">{{ project.number }}</span>
      <span class="media-placeholder__label">Project image placeholder</span>
      <span class="media-placeholder__orb" aria-hidden="true"></span>
      <span class="project-card__arrow" aria-hidden="true">↗</span>
    </div>
    <div class="project-card__meta"><span>{{ project.category }}</span><span>{{ project.number }}</span></div>
    <h3>{{ project.title }}</h3>
    <p>{{ project.summary }}</p>
  </NuxtLink>
</template>
