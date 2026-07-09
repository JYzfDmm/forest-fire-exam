<template>
  <div class="page-container" style="padding-bottom: 80px;">
    <h2 style="color: #2E7D32; font-size: 18px; font-weight: 600; margin-bottom: 16px;">学习统计</h2>
    
    <div class="card">
      <div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
        <div style="text-align: center;">
          <div class="stat-value">{{ totalAnswered }}</div>
          <div class="stat-label">总做题数</div>
        </div>
        <div style="text-align: center;">
          <div class="stat-value">{{ overallCorrectRate }}%</div>
          <div class="stat-label">总正确率</div>
        </div>
        <div style="text-align: center;">
          <div class="stat-value">{{ studyDays }}</div>
          <div class="stat-label">学习天数</div>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div style="margin-top: 16px;">
        <div style="font-size: 14px; color: #666; margin-bottom: 12px;">各题型正确率</div>
        <div v-for="(category, key) in categories" :key="key" style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 14px; color: #333;">{{ category.name }}</span>
            <span style="font-size: 14px; color: #2E7D32;">{{ getCategoryCorrectRate(key) }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" :style="{ width: getCategoryCorrectRate(key) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div style="font-size: 14px; color: #666; margin-bottom: 12px;">近7天做题趋势</div>
      <div style="height: 150px;">
        <canvas ref="trendChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useStore } from '../store'

Chart.register(...registerables)

const { categories, getCategoryStats, answeredCount, correctRate, state, getRecentStats } = useStore()

const totalAnswered = answeredCount
const overallCorrectRate = correctRate
const studyDays = computed(() => state.dailyStats.length)

const trendChart = ref(null)

function getCategoryCorrectRate(key) {
  const stats = getCategoryStats(key)
  if (stats.total === 0) return 0
  return Math.round((stats.correct / stats.total) * 100)
}

onMounted(() => {
  const dailyStats = getRecentStats(7)
  const labels = dailyStats.map(d => d.date)
  const data = dailyStats.map(d => d.questionCount)
  
  new Chart(trendChart.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '做题数',
        data,
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#F0F0F0' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  })
})
</script>
