<template>
  <div class="page-container" style="padding-bottom: 80px;">
    <h2 style="color: #2E7D32; font-size: 18px; font-weight: 600; margin-bottom: 16px;">收藏夹</h2>
    
    <div v-if="favoriteQuestions.length === 0" class="card" style="text-align: center; padding: 40px;">
      <div style="font-size: 48px; margin-bottom: 16px;">📚</div>
      <div style="font-size: 16px; color: #666;">暂无收藏</div>
    </div>
    
    <div v-else>
      <div 
        v-for="question in favoriteQuestions" 
        :key="question.id"
        class="card"
        style="margin-bottom: 12px;"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #666;">{{ categories[question.type]?.name }}</div>
          <button @click="toggleFavorite(question.id)" style="font-size: 12px; color: #2E7D32;">取消收藏</button>
        </div>
        
        <div style="font-size: 16px; line-height: 1.6; color: #333;">{{ question.question }}</div>
        
        <div v-if="question.answer" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #E8E8E8;">
          <div style="font-size: 14px; color: #2E7D32; font-weight: 500;">答案：{{ formatAnswer(question.answer) }}</div>
          <div v-if="question.explanation" style="font-size: 13px; color: #666; margin-top: 4px;">{{ question.explanation }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '../store'

const { categories, state, toggleFavorite, getQuestionById } = useStore()

const favoriteQuestions = computed(() => {
  return state.favorites.map(id => getQuestionById(id)).filter(q => q)
})

function formatAnswer(answer) {
  if (Array.isArray(answer)) return answer.join('、')
  return answer
}
</script>
