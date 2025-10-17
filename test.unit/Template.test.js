import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'

import App from '../src/App.vue'
import HomeView from '../src/views/HomeView.vue'

const routes = [
  { path: '/', component: HomeView }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

describe('App.vue', () => {
  it('renders App and mounts HomeView on "/" route', async () => {

    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.html()).toContain('src/App.vue has been loaded successfully')
    expect(wrapper.html()).toContain('You are currently accessing src/views/HomeView.vue')
  })
})
