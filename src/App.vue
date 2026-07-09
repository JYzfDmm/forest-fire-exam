<template>
  <div id="app" class="min-h-screen flex flex-col bg-gray-50">
    <div class="flex-1 flex flex-col max-w-md mx-auto w-full">
      <nav class="bg-white border-b border-gray-200 shadow-sm">
        <div class="flex justify-around items-center h-16">
          <button 
            v-for="item in navItems" 
            :key="item.path"
            @click="$router.push(item.path)"
            class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-accent transition-colors"
            :class="{ 'text-accent': $route.path === item.path }"
          >
            <component :is="item.icon" class="w-6 h-6 mb-1" />
            <span class="text-xs">{{ item.label }}</span>
          </button>
        </div>
      </nav>
      <router-view class="flex-1 pt-4" />
    </div>
  </div>
</template>

<script setup>
import { Home, BookOpen, FileText, BarChart3, Settings } from 'lucide-vue-next'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/practice/category', label: '题型专练', icon: BookOpen },
  { path: '/exam', label: '考试', icon: FileText },
  { path: '/stats', label: '统计', icon: BarChart3 },
  { path: '/settings', label: '设置', icon: Settings }
]
</script>
