<script setup lang="ts">
const links = [
  { label: 'Work', href: '/#work' },
  { label: 'Experience', href: '/#experience' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' }
]
</script>

<template>
  <header class="site-header">
    <NuxtLink class="wordmark" to="/" aria-label="Irham Maulana Johani, home">IMJ<span>•</span></NuxtLink>
    <nav aria-label="Main navigation">
      <NuxtLink v-for="link in links" :key="link.label" :to="link.href">{{ link.label }}</NuxtLink>
    </nav>
    <span class="header-note">Portfolio · 2026</span>
  </header>
</template>
