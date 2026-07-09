<template>
  <div class="page-container" style="padding-bottom: 80px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 style="color: #2E7D32; font-size: 18px; font-weight: 600;">错题集</h2>
      <button @click="showFilter = !showFilter" style="font-size: 14px; color: #2E7D32;">筛选</button>
    </div>
    
    <div v-if="showFilter" class="card" style="margin-bottom: 16px;">
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        <button 
          v-for="(category, key) in categories" 
          :key="key"
          @click="filterCategory = filterCategory === key ? '' : key"
          :style="{
            padding: '6px 12px',
            border: '1px solid',
            borderColor: filterCategory === key ? '#2E7D32' : '#E0E0E0',
            borderRadius: '16px',
            fontSize: '13px',
            backgroundColor: filterCategory === key ? '#C8E6C9' : 'white',
            color: filterCategory === key ? '#2E7D32' : '#666'
          }"
        >{{ category.name }}</button>
      </div>
    </div>
    
    <div v-if="filteredWrongQuestions.length === 0" class="card" style="text-align: center; padding: 40px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
      <div style="font-size: 16px; color: #666;">暂无错题</div>
    </div>
    
    <div v-else>
      <div 
        v-for="(item, index) in filteredWrongQuestions" 
        :key="item.question.id"
        class="card"
        style="margin-bottom: 12px;"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #666;">{{ categories[item.question.type]?.name }} · 错误 {{ item.wrongCount }} 次</div>
          <button @click="removeWrong(item.question.id)" style="font-size: 12px; color: #E53935;">移除</button>
        </div>
        
        <div @click="reviewQuestion(index)" style="font-size: 16px; line-height: 1.6; color: #333; cursor: pointer;">{{ item.question.question }}</div>
        
        <div v-if="item.question.type === 'single_choice' || item.question.type === 'multiple_choice'" style="margin-top: 12px;">
          <div style="font-size: 14px; color: #E53935; margin-bottom: 4px;">你的答案：{{ formatAnswer(item.userAnswer) }}</div>
          <div style="font-size: 14px; color: #2E7D32;">正确答案：{{ formatAnswer(item.question.answer) }}</div>
        </div>
        
        <div v-if="item.question.type === 'true_false'" style="margin-top: 12px;">
          <div style="font-size: 14px; color: #E53935; margin-bottom: 4px;">你的答案：{{ item.userAnswer === 0 ? '正确' : '错误' }}</div>
          <div style="font-size: 14px; color: #2E7D32;">正确答案：{{ item.question.answer === '对' || item.question.answer === '正确' || item.question.answer === 'A' ? '正确' : '错误' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../store'

const { categories, state, removeWrongQuestion, getQuestionById } = useStore()

const showFilter = ref(false)
const filterCategory = ref('')

const filteredWrongQuestions = computed(() => {
  const result = state.wrongQuestions.map(item => ({
    ...item,
    question: getQuestionById(item.questionId)
  })).filter(item => item.question)
  
  if (!filterCategory.value) return result
  return result.filter(item => item.question.type === filterCategory.value)
})

function removeWrong(id) {
  removeWrongQuestion(id)
}

function formatAnswer(answer) {
  if (Array.isArray(answer)) return answer.join('、')
  return answer
}

function reviewQuestion(index) {
  const question = filteredWrongQuestions.value[index].question
}
</script>
