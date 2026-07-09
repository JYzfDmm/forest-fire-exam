<template>
  <div class="page-container">
    <div class="card">
      <h2 style="color: #2E7D32; font-size: 18px; font-weight: 600; margin-bottom: 16px;">题型专练</h2>
      
      <div 
        v-for="(category, key) in categories" 
        :key="key"
        @click="startCategoryPractice(key)"
        style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px dashed #E8E8E8; cursor: pointer;"
      >
        <div style="display: flex; align-items: center;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background-color: #C8E6C9; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            <component :is="getIcon(key)" style="width: 20px; height: 20px; color: #2E7D32;" />
          </div>
          <div>
            <div style="font-size: 16px; color: #333; font-weight: 500;">{{ category.name }}</div>
            <div style="font-size: 12px; color: #666;">共 {{ getQuestionsByCategory(key).length }} 题</div>
          </div>
        </div>
        <span style="color: #999;">></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Circle, CheckSquare, ToggleLeft, Type, FileText } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useStore } from '../store'

const router = useRouter()
const { categories, getQuestionsByCategory } = useStore()

const iconMap = {
  single_choice: Circle,
  multiple_choice: CheckSquare,
  true_false: ToggleLeft,
  fill_blank: Type,
  short_answer: FileText
}

function getIcon(key) {
  return iconMap[key] || Circle
}

function startCategoryPractice(category) {
  router.push(`/practice/${category}`)
}
</script>
