export type Project = {
  slug: string
  number: string
  title: string
  category: string
  summary: string
  role: string
  context: string
  stack: string[]
  status: string
  mediaNote: string
}

export const projects: Project[] = [
  {
    slug: 'route-optimization',
    number: '01',
    title: 'Route optimization',
    category: 'Fleet management · GIS internship',
    summary: 'A route optimization feature for a fleet management website, built with HERE API.',
    role: 'GIS Intern at PT Nusantara Secom Infotech',
    context: 'The work involved a fleet management website. Internal product details and publication permission for screenshots still need confirmation.',
    stack: ['Vue / Nuxt', 'Node.js', 'Express', 'HERE API'],
    status: 'Project details and public-use permission to confirm',
    mediaNote: 'Placeholder: approved product screenshots or a clearly labeled concept illustration.'
  },
  {
    slug: 'photo-picker',
    number: '02',
    title: 'Photo picker',
    category: 'Photography business · Web product',
    summary: 'A website where graduation photography clients select raw photos for editing.',
    role: 'Founder / project owner — exact role to confirm',
    context: 'The known purpose is to let clients choose photos from a graduation session. Stack, feature details, original appearance, and outcomes are not confirmed yet.',
    stack: [],
    status: 'Product details and public demo to confirm',
    mediaNote: 'Placeholder: original interface screenshots, if available and approved.'
  }
]

export const experience = [
  { role: 'Frontend Web Developer', organization: 'Solu Filantropi Teknologi', period: 'Period to confirm' },
  { role: 'Programming Teacher', organization: 'Timedoor', period: 'Period to confirm' },
  { role: 'Founder / CEO · Project Manager', organization: 'Sutoori Production', period: 'Period and title details to confirm' },
  { role: 'GIS Intern', organization: 'PT Nusantara Secom Infotech', period: 'Period to confirm' }
]

export const profile = {
  name: 'Irham Maulana Johani',
  intro: 'I build web experiences and digital products.',
  bio: 'More about Irham, his focus, and the work he wants to do is being prepared.',
  location: 'Location to confirm',
  email: 'Email address to add',
  linkedin: 'LinkedIn URL to verify'
}
