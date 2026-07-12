<template>
  <div class="page-container">
    <div class="card" style="padding: 0; overflow: hidden;">
      <div style="background-color: #2E7D32; color: white; padding: 16px; text-align: center; font-size: 18px; font-weight: 600;">
        森林消防考试刷题（内部）
      </div>
      
      <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-around; margin-bottom: 24px;">
          <div style="text-align: center;">
            <div class="stat-value">{{ totalQuestionCount }}</div>
            <div class="stat-label">总题数</div>
          </div>
          <div style="text-align: center;">
            <div class="stat-value">{{ answeredCount }}</div>
            <div class="stat-label">已做题</div>
          </div>
          <div style="text-align: center;">
            <div class="stat-value">{{ correctRate }}%</div>
            <div class="stat-label">正确率</div>
          </div>
        </div>
        
        <div style="margin-bottom: 24px;">
          <div style="font-size: 14px; color: #666; margin-bottom: 8px;">今日进度</div>
          <div class="progress-bar">
            <div class="progress-bar-fill" :style="{ width: todayProgressPercent + '%' }"></div>
          </div>
          <div style="font-size: 12px; color: #666; margin-top: 6px;">已完成 {{ todayCompleted }} / 100 题</div>
        </div>
        
        <div style="border-top: 1px dashed #E8E8E8; padding-top: 4px;">
          <div 
            v-for="(item, index) in menuItems" 
            :key="item.key"
            @click="goTo(item.key)"
            style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px dashed #E8E8E8; cursor: pointer;"
            :class="{ 'border-bottom': index === menuItems.length - 1 }"
          >
            <div style="display: flex; align-items: center;">
              <span style="font-size: 16px; color: #333;">{{ item.name }}</span>
              <span v-if="item.badge" :class="item.badgeClass">{{ item.badge }}</span>
            </div>
            <span v-if="item.button" style="background-color: #43A047; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">{{ item.button }}</span>
            <span v-else style="color: #999;">></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../store'

const router = useRouter()
const { totalQuestionCount, answeredCount, correctRate, todayStats, wrongCount, favoriteCount } = useStore()

const todayCompleted = computed(() => todayStats.value.questionCount)

const todayProgressPercent = computed(() => {
  return Math.min(Math.round((todayCompleted.value / 100) * 100), 100)
})

const wrongQuestionCount = computed(() => wrongCount.value)

const menuItems = computed(() => [
  { key: 'sequential', name: '顺序练习', button: '继续' },
  { key: 'random', name: '随机练习' },
  { key: 'exam', name: '模拟考试' },
  { key: 'category', name: '题型专练' },
  { key: 'wrong', name: '错题集', badge: `(${wrongQuestionCount.value})`, badgeClass: 'badge-red' },
  { key: 'favorites', name: '收藏夹', badge: `(${favoriteCount.value})`, badgeClass: 'badge-green' },
  { key: 'stats', name: '学习统计' }
])

function goTo(key) {
  const routes = {
    sequential: '/practice/sequential',
    random: '/practice/random',
    exam: '/exam',
    category: '/practice/category',
    wrong: '/wrong',
    favorites: '/favorites',
    stats: '/stats'
  }
  router.push(routes[key])
}
</script>
