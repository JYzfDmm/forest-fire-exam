import { reactive, computed } from 'vue'
import questions from '../data/questions.json'

const STORAGE_KEY = 'forest_fire_exam_data'

const defaultData = {
  progress: {
    single_choice: { currentIndex: 0, total: 106 },
    multiple_choice: { currentIndex: 0, total: 80 },
    true_false: { currentIndex: 0, total: 120 },
    fill_blank: { currentIndex: 0, total: 196 },
    short_answer: { currentIndex: 0, total: 38 },
    sequential: { currentIndex: 0 }
  },
  records: [],
  wrongQuestions: [],
  favorites: [],
  examRecords: [],
  dailyStats: []
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return { ...defaultData, ...JSON.parse(saved) }
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  }
  return { ...defaultData }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save data:', e)
  }
}

const state = reactive(loadData())

const categories = {
  single_choice: { name: '单选题', icon: 'circle' },
  multiple_choice: { name: '多选题', icon: 'check-square' },
  true_false: { name: '判断题', icon: 'toggle-left' },
  fill_blank: { name: '填空题', icon: 'text-cursor' },
  short_answer: { name: '简答题', icon: 'file-text' }
}

export function useStore() {
  const allQuestions = computed(() => {
    const result = []
    Object.keys(categories).forEach(key => {
      questions.categories[key]?.forEach(q => result.push(q))
    })
    return result
  })

  const categoryCounts = computed(() => {
    const counts = {}
    Object.keys(categories).forEach(key => {
      counts[key] = questions.categories[key]?.length || 0
    })
    return counts
  })

  const totalQuestionCount = computed(() => allQuestions.value.length)

  const sequentialProgress = computed(() => {
    return state.progress.sequential?.currentIndex || 0
  })

  const answeredCount = computed(() => state.records.length)

  const correctRate = computed(() => {
    if (state.records.length === 0) return 0
    const correct = state.records.filter(r => r.isCorrect).length
    return Math.round((correct / state.records.length) * 100)
  })

  const wrongCount = computed(() => state.wrongQuestions.length)

  const favoriteCount = computed(() => state.favorites.length)

  const todayStats = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    const stat = state.dailyStats.find(s => s.date === today)
    return stat || { date: today, questionCount: 0, correctCount: 0, duration: 0 }
  })

  function getQuestionsByCategory(category) {
    return questions.categories[category] || []
  }

  function getQuestionById(id) {
    for (const category of Object.keys(categories)) {
      const q = questions.categories[category]?.find(item => item.id === id)
      if (q) return q
    }
    return null
  }

  function updateProgress(category, index) {
    if (category === 'sequential') {
      if (state.progress.sequential) {
        state.progress.sequential.currentIndex = index
        saveData(state)
      }
    } else if (state.progress[category]) {
      state.progress[category].currentIndex = index
      saveData(state)
    }
  }

  function addRecord(record) {
    state.records.push({
      ...record,
      timestamp: new Date().toISOString()
    })
    
    const today = new Date().toISOString().split('T')[0]
    const statIndex = state.dailyStats.findIndex(s => s.date === today)
    if (statIndex >= 0) {
      state.dailyStats[statIndex].questionCount++
      if (record.isCorrect) {
        state.dailyStats[statIndex].correctCount++
      }
    } else {
      state.dailyStats.push({
        date: today,
        questionCount: 1,
        correctCount: record.isCorrect ? 1 : 0,
        duration: 0
      })
    }
    
    saveData(state)
  }

  function addWrongQuestion(questionId, userAnswer) {
    const existing = state.wrongQuestions.find(w => w.questionId === questionId)
    if (existing) {
      existing.wrongCount++
      existing.lastWrongAt = new Date().toISOString()
      existing.userAnswer = userAnswer
    } else {
      state.wrongQuestions.push({
        questionId,
        userAnswer,
        wrongCount: 1,
        lastWrongAt: new Date().toISOString()
      })
    }
    saveData(state)
  }

  function removeWrongQuestion(questionId) {
    const index = state.wrongQuestions.findIndex(w => w.questionId === questionId)
    if (index >= 0) {
      state.wrongQuestions.splice(index, 1)
      saveData(state)
    }
  }

  function toggleFavorite(questionId) {
    const index = state.favorites.indexOf(questionId)
    if (index >= 0) {
      state.favorites.splice(index, 1)
    } else {
      state.favorites.push(questionId)
    }
    saveData(state)
  }

  function isFavorite(questionId) {
    return state.favorites.includes(questionId)
  }

  function addExamRecord(record) {
    state.examRecords.unshift({
      ...record,
      id: `exam_${Date.now()}`,
      answeredAt: new Date().toISOString()
    })
    saveData(state)
  }

  function getCategoryStats(category) {
    const categoryRecords = state.records.filter(r => r.type === category)
    if (categoryRecords.length === 0) return { total: 0, correct: 0, rate: 0 }
    const correct = categoryRecords.filter(r => r.isCorrect).length
    return {
      total: categoryRecords.length,
      correct,
      rate: Math.round((correct / categoryRecords.length) * 100)
    }
  }

  function getRecentStats(days = 7) {
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const stat = state.dailyStats.find(s => s.date === dateStr)
      result.push({
        date: dateStr.slice(5),
        questionCount: stat?.questionCount || 0,
        correctCount: stat?.correctCount || 0,
        rate: stat && stat.questionCount > 0 ? Math.round((stat.correctCount / stat.questionCount) * 100) : 0
      })
    }
    return result
  }

  function exportData() {
    return JSON.stringify(state, null, 2)
  }

  function importData(data) {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      Object.assign(state, { ...defaultData, ...parsed })
      saveData(state)
      return true
    } catch (e) {
      console.error('Failed to import data:', e)
      return false
    }
  }

  function resetProgress() {
    Object.keys(state.progress).forEach(key => {
      state.progress[key].currentIndex = 0
    })
    state.records = []
    state.wrongQuestions = []
    state.examRecords = []
    state.dailyStats = []
    saveData(state)
  }

  return {
    state,
    categories,
    questions,
    allQuestions,
    totalQuestionCount,
    categoryCounts,
    answeredCount,
    correctRate,
    wrongCount,
    favoriteCount,
    todayStats,
    sequentialProgress,
    getQuestionsByCategory,
    getQuestionById,
    updateProgress,
    addRecord,
    addWrongQuestion,
    removeWrongQuestion,
    toggleFavorite,
    isFavorite,
    addExamRecord,
    getCategoryStats,
    getRecentStats,
    exportData,
    importData,
    resetProgress
  }
}
