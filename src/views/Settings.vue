<template>
  <div class="page-container">
    <h2 style="color: #2E7D32; font-size: 18px; font-weight: 600; margin-bottom: 16px;">设置</h2>
    
    <div class="card">
      <div style="font-size: 14px; color: #666; margin-bottom: 12px;">数据管理</div>
      
      <button @click="exportData" style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px dashed #E8E8E8; background: none; border-top: none; border-left: none; border-right: none;">
        <div>导出数据</div>
        <span style="color: #999;">></span>
      </button>
      
      <button @click="triggerImport" style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px dashed #E8E8E8; background: none; border-top: none; border-left: none; border-right: none;">
        <div>导入数据</div>
        <span style="color: #999;">></span>
      </button>
      
      <button @click="confirmReset" style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 14px 0; background: none; border: none;">
        <div style="color: #E53935;">重置进度</div>
        <span style="color: #999;">></span>
      </button>
    </div>
    
    <div class="card">
      <div style="font-size: 14px; color: #666; margin-bottom: 12px;">题库管理</div>
      
      <button @click="showQuestionBankStats" style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px dashed #E8E8E8; background: none; border-top: none; border-left: none; border-right: none;">
        <div>题库统计</div>
        <span style="color: #999;">></span>
      </button>
      
      <button @click="triggerImportQuestions" style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 14px 0; background: none; border: none;">
        <div>导入题库</div>
        <span style="color: #999;">></span>
      </button>
    </div>
    
    <div class="card">
      <div style="font-size: 14px; color: #666; margin-bottom: 12px;">关于</div>
      
      <div style="padding: 14px 0; border-bottom: 1px dashed #E8E8E8;">
        <div style="font-size: 12px; color: #666;">版本</div>
        <div style="font-size: 14px; color: #333;">1.0.0</div>
      </div>
      
      <div style="padding: 14px 0;">
        <div style="font-size: 12px; color: #666;">说明</div>
        <div style="font-size: 14px; color: #333;">森林消防考试刷题系统，帮助队员高效备考</div>
      </div>
    </div>

    <input 
      ref="importInput"
      type="file" 
      accept=".json" 
      class="hidden" 
      @change="handleImport"
    />
    <input 
      ref="importQuestionsInput"
      type="file" 
      accept=".json" 
      class="hidden" 
      @change="handleImportQuestions"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from '../store'

const { exportData, importData, resetProgress, categories, questions } = useStore()

const importInput = ref(null)
const importQuestionsInput = ref(null)

function triggerImport() {
  importInput.value?.click()
}

function triggerImportQuestions() {
  importQuestionsInput.value?.click()
}

function handleImport(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = importData(e.target.result)
    if (result) {
      alert('数据导入成功')
    } else {
      alert('数据导入失败，请检查文件格式')
    }
  }
  reader.readAsText(file)
}

function handleImportQuestions(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (data.categories) {
        Object.assign(questions.categories, data.categories)
        alert('题库导入成功')
      } else {
        alert('题库格式不正确')
      }
    } catch {
      alert('题库导入失败')
    }
  }
  reader.readAsText(file)
}

function confirmReset() {
  if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
    resetProgress()
    alert('进度已重置')
  }
}

function showQuestionBankStats() {
  let msg = '题库统计：\n\n'
  Object.keys(categories).forEach(key => {
    const count = questions.categories[key]?.length || 0
    msg += `${categories[key].name}：${count} 题\n`
  })
  const total = Object.values(questions.categories).reduce((sum, arr) => sum + (arr?.length || 0), 0)
  msg += `\n总计：${total} 题`
  alert(msg)
}
</script>
