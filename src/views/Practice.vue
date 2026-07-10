<template>
  <div class="page-container" style="padding-bottom: 80px;">
    <div v-if="!isStarted && isSequential">
      <div class="card">
        <h2 style="color: #2E7D32; font-size: 18px; font-weight: 600; margin-bottom: 16px;">顺序练习</h2>
        <div style="margin-bottom: 20px;">
          <div style="font-size: 14px; color: #666; margin-bottom: 12px;">题库总数：{{ categoryCounts.single_choice + categoryCounts.multiple_choice + categoryCounts.true_false + categoryCounts.fill_blank + categoryCounts.short_answer }} 题</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <span style="background-color: #E8F5E9; color: #2E7D32; padding: 6px 12px; border-radius: 16px; font-size: 13px;">单选题 {{ categoryCounts.single_choice }} 题</span>
            <span style="background-color: #FFF3E0; color: #E65100; padding: 6px 12px; border-radius: 16px; font-size: 13px;">多选题 {{ categoryCounts.multiple_choice }} 题</span>
            <span style="background-color: #E3F2FD; color: #1565C0; padding: 6px 12px; border-radius: 16px; font-size: 13px;">判断题 {{ categoryCounts.true_false }} 题</span>
            <span style="background-color: #FCE4EC; color: #C2185B; padding: 6px 12px; border-radius: 16px; font-size: 13px;">填空题 {{ categoryCounts.fill_blank }} 题</span>
            <span style="background-color: #F3E5F5; color: #7B1FA2; padding: 6px 12px; border-radius: 16px; font-size: 13px;">简答题 {{ categoryCounts.short_answer }} 题</span>
          </div>
        </div>
        <button 
          @click="handleStartSequential" 
          style="width: 100%; background-color: #2E7D32; color: white; padding: 14px; border-radius: 8px; font-size: 16px; font-weight: 500; border: none;"
        >开始练习</button>
      </div>
    </div>
    
    <div v-if="!isStarted && practiceCategory">
      <div class="card">
        <h2 style="color: #2E7D32; font-size: 18px; font-weight: 600; margin-bottom: 16px;">{{ categories[practiceCategory]?.name }}专练</h2>
        <button 
          @click="handleStartCategory" 
          style="width: 100%; background-color: #2E7D32; color: white; padding: 14px; border-radius: 8px; font-size: 16px; font-weight: 500; border: none;"
        >开始练习</button>
      </div>
    </div>
    
    <div v-if="showContinueDialog" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div class="card" style="width: 90%; max-width: 320px; padding: 24px;">
        <div style="font-size: 16px; color: #333; margin-bottom: 20px; text-align: center;">您上次练习到第 {{ currentProgress + 1 }} 题，是否继续？</div>
        <div style="display: flex; gap: 12px;">
          <button 
            @click="continuePractice" 
            style="flex: 1; background-color: #2E7D32; color: white; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: 500; border: none;"
          >继续练习</button>
          <button 
            @click="restartPractice" 
            style="flex: 1; border: 1px solid #2E7D32; color: #2E7D32; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: 500; background-color: white;"
          >重新开始</button>
        </div>
      </div>
    </div>
    
    <div v-if="showRandomComplete" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div class="card" style="width: 90%; max-width: 320px; padding: 24px;">
        <div style="font-size: 16px; color: #333; margin-bottom: 20px; text-align: center;">已完成随机练习的 50 道题！</div>
        <button 
          @click="goHome" 
          style="width: 100%; background-color: #2E7D32; color: white; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: 500; border: none;"
        >返回首页</button>
      </div>
    </div>
    
    <div v-else-if="currentQuestion">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div style="font-size: 14px; color: #666;">{{ categoryName }} 第 {{ currentIndex + 1 }}/{{ questionList.length }} 题</div>
        <button 
          @click="handleToggleFavorite"
          :style="{ 
            color: isFavorite ? '#2E7D32' : '#999',
            background: 'none',
            border: 'none',
            fontSize: '14px'
          }"
        >收藏</button>
      </div>
      
      <div class="card">
        <div style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">{{ currentQuestion.question }}</div>
        
        <div v-if="currentQuestion.type === 'single_choice'" style="margin-bottom: 16px;">
          <div 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            @click="selectOption(index)"
            :class="[
              'option-item',
              { 'selected': selectedOptions.includes(index), 'correct': showAnswer && isCorrectOption(index), 'incorrect': showAnswer && selectedOptions.includes(index) && !isCorrectOption(index) },
              { 'correct-answer': showAnswer && isCorrectOption(index) && !selectedOptions.includes(index) }
            ]"
            :style="{
              borderColor: showAnswer && isCorrectOption(index) ? '#43A047' : (showAnswer && selectedOptions.includes(index) && !isCorrectOption(index) ? '#E53935' : (selectedOptions.includes(index) ? '#2E7D32' : '#E0E0E0')),
              backgroundColor: showAnswer && isCorrectOption(index) ? '#C8E6C9' : (showAnswer && selectedOptions.includes(index) && !isCorrectOption(index) ? '#FFCDD2' : (selectedOptions.includes(index) ? '#C8E6C9' : 'white'))
            }"
          >
            <span class="option-letter">{{ ['A', 'B', 'C', 'D'][index] }}.</span>
            <span>{{ option.replace(/^[ABCD]\.\s*/, '') }}</span>
          </div>
        </div>
        
        <div v-else-if="currentQuestion.type === 'multiple_choice'" style="margin-bottom: 16px;">
          <div v-if="!showAnswer" style="font-size: 16px; color: #E53935; margin-bottom: 12px; font-weight: 500;">提示：多选题最少选两个以上答案</div>
          <div v-if="!showAnswer && selectedOptions.length === 1" style="font-size: 14px; color: #E53935; margin-bottom: 12px;">请至少选择两个答案</div>
          <div 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            @click="toggleOption(index)"
            :class="[
              'option-item',
              { 'selected': selectedOptions.includes(index), 'correct': showAnswer && isCorrectOption(index), 'incorrect': showAnswer && selectedOptions.includes(index) && !isCorrectOption(index) },
              { 'correct-answer': showAnswer && isCorrectOption(index) && !selectedOptions.includes(index) }
            ]"
            :style="{
              borderColor: showAnswer && isCorrectOption(index) ? '#43A047' : (showAnswer && selectedOptions.includes(index) && !isCorrectOption(index) ? '#E53935' : (selectedOptions.includes(index) ? '#2E7D32' : '#E0E0E0')),
              backgroundColor: showAnswer && isCorrectOption(index) ? '#C8E6C9' : (showAnswer && selectedOptions.includes(index) && !isCorrectOption(index) ? '#FFCDD2' : (selectedOptions.includes(index) ? '#C8E6C9' : 'white'))
            }"
          >
            <span class="option-letter">{{ ['A', 'B', 'C', 'D'][index] }}.</span>
            <span>{{ option.replace(/^[ABCD]\.\s*/, '') }}</span>
          </div>
          <button 
            v-if="!showAnswer && selectedOptions.length >= 2"
            @click="submitMultipleChoiceAnswer"
            style="width: 100%; background-color: #2E7D32; color: white; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: 500; border: none; margin-top: 12px;"
          >确认答案</button>
        </div>
        
        <div v-else-if="currentQuestion.type === 'true_false'" style="margin-bottom: 16px;">
          <div style="display: flex; gap: 12px;">
            <button 
              @click="selectOption(0)"
              :style="{
                flex: 1,
                padding: '16px',
                border: '1px solid',
                borderColor: showAnswer && !isCorrectOption(0) && selectedOptions.includes(0) ? '#E53935' : (showAnswer && isCorrectOption(0) ? '#43A047' : (selectedOptions.includes(0) ? '#2E7D32' : '#E0E0E0')),
                borderRadius: '8px',
                backgroundColor: showAnswer && !isCorrectOption(0) && selectedOptions.includes(0) ? '#FFCDD2' : (showAnswer && isCorrectOption(0) ? '#C8E6C9' : (selectedOptions.includes(0) ? '#C8E6C9' : 'white')),
                fontSize: '16px',
                color: '#333'
              }"
            >正确</button>
            <button 
              @click="selectOption(1)"
              :style="{
                flex: 1,
                padding: '16px',
                border: '1px solid',
                borderColor: showAnswer && !isCorrectOption(1) && selectedOptions.includes(1) ? '#E53935' : (showAnswer && isCorrectOption(1) ? '#43A047' : (selectedOptions.includes(1) ? '#2E7D32' : '#E0E0E0')),
                borderRadius: '8px',
                backgroundColor: showAnswer && !isCorrectOption(1) && selectedOptions.includes(1) ? '#FFCDD2' : (showAnswer && isCorrectOption(1) ? '#C8E6C9' : (selectedOptions.includes(1) ? '#C8E6C9' : 'white')),
                fontSize: '16px',
                color: '#333'
              }"
            >错误</button>
          </div>
        </div>
        
        <div v-else-if="currentQuestion.type === 'fill_blank'" style="margin-bottom: 16px;">
          <div style="font-size: 14px; color: #666; margin-top: 16px; margin-bottom: 20px;">点击空白处输入答案，多个空按顺序填写</div>
          <div v-for="(blank, idx) in blanks" :key="idx" style="margin-bottom: 12px; display: flex; align-items: center;">
            <span style="font-size: 16px; color: #333; margin-right: 8px;">{{ idx + 1 }}.</span>
            <span style="font-size: 16px; color: #333; margin-right: 4px;">（</span>
            <input 
              v-model="userAnswers[idx]"
              :disabled="showAnswer"
              type="text"
              :placeholder="showAnswer ? blank.answer : ''"
              :style="{
                borderBottom: '2px solid',
                borderBottomColor: showAnswer ? (isBlankCorrect(idx) ? '#2E7D32' : '#E53935') : '#E0E0E0',
                minWidth: '150px',
                padding: '4px 8px',
                fontSize: '16px',
                fontWeight: '600',
                color: showAnswer ? (isBlankCorrect(idx) ? '#2E7D32' : '#E53935') : '#333',
                background: 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                outline: 'none',
                textAlign: 'center'
              }"
            />
            <span style="font-size: 16px; color: #333; margin-left: 4px;">）</span>
          </div>
          <button 
            v-if="!showAnswer"
            @click="submitFillBlankAnswer"
            style="width: 100%; background-color: #2E7D32; color: white; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: 500; border: none; margin-top: 16px;"
          >确认答案</button>
        </div>
        
        <div v-else-if="currentQuestion.type === 'short_answer'" style="margin-bottom: 16px;">
          <button 
            v-if="!showAnswer"
            @click="showAnswer = true"
            style="width: 100%; background-color: #2E7D32; color: white; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: 500; border: none; margin-bottom: 16px;"
          >显示答案</button>
          
          <div 
            v-if="showAnswer"
            style="padding: 16px; border: 1px solid #FFB300; border-radius: 8px; background-color: #FFF8E1;"
          >
            <div style="font-weight: 600; color: #2E7D32; margin-bottom: 8px;">参考答案：</div>
            <div style="color: #333; line-height: 1.6;">{{ currentQuestion.answer }}</div>
          </div>
        </div>
        
        <div v-if="showAnswer && (currentQuestion.type === 'single_choice' || currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false' || currentQuestion.type === 'fill_blank')" class="answer-card">
          <div class="answer-card-title">答案：{{ formatAnswer(currentQuestion.answer) }}</div>
          <div v-if="currentQuestion.explanation" style="margin-top: 8px;">
            <div style="font-weight: 500; color: #2E7D32; margin-bottom: 4px;">解析：</div>
            <div class="answer-card-content">{{ currentQuestion.explanation }}</div>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
          <button 
            @click="prevQuestion"
            :disabled="currentIndex === 0"
            style="padding: 12px 24px; border: 1px solid #2E7D32; border-radius: 8px; font-size: 16px; color: #2E7D32; background-color: white;"
          >上一题</button>
          <button 
            @click="nextQuestion"
            style="padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; color: white; background-color: #2E7D32;"
          >下一题</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../store'

const route = useRoute()
const router = useRouter()
const { categories, state, getQuestionsByCategory, toggleFavorite, isFavorite: checkFavorite, addRecord, addWrongQuestion, sequentialProgress, updateProgress, categoryCounts } = useStore()

const isSequential = computed(() => route.path === '/practice/sequential')
const isRandom = computed(() => route.path === '/practice/random')
const practiceCategory = computed(() => {
  if (categories[route.params.category]) {
    return route.params.category
  }
  return null
})
const currentProgress = computed(() => {
  if (isSequential.value) {
    return state.progress.sequential?.currentIndex || 0
  }
  if (practiceCategory.value) {
    return state.progress[practiceCategory.value]?.currentIndex || 0
  }
  return 0
})
const isStarted = ref(false)
const showContinueDialog = ref(false)
const showRandomComplete = ref(false)
const questionCount = ref(10)
const questionList = ref([])
const currentIndex = ref(0)
const selectedOptions = ref([])
const userAnswers = ref([])
const showAnswer = ref(false)
const blanks = ref([])

const currentQuestion = computed(() => questionList.value[currentIndex.value])

const categoryName = computed(() => {
  if (!currentQuestion.value) return ''
  return categories[currentQuestion.value.type]?.name || ''
})

const isFavorite = computed(() => {
  if (!currentQuestion.value) return false
  return checkFavorite(currentQuestion.value.id)
})

function startPractice(startIndex = null) {
  if (practiceCategory.value) {
    questionList.value = getQuestionsByCategory(practiceCategory.value)
    currentIndex.value = startIndex ?? (state.progress[practiceCategory.value]?.currentIndex || 0)
  } else if (isSequential.value) {
    const allQuestions = []
    Object.keys(categories).forEach(key => {
      allQuestions.push(...getQuestionsByCategory(key))
    })
    questionList.value = allQuestions
    currentIndex.value = startIndex ?? sequentialProgress.value
  } else {
    const allQuestions = []
    Object.keys(categories).forEach(key => {
      allQuestions.push(...getQuestionsByCategory(key))
    })
    const shuffled = [...allQuestions].sort(() => Math.random() - Math.random())
    questionList.value = shuffled.slice(0, 50)
    currentIndex.value = 0
  }
  isStarted.value = true
  selectedOptions.value = []
  showAnswer.value = false
}

function handleStartSequential() {
  if (sequentialProgress.value > 0) {
    showContinueDialog.value = true
  } else {
    startPractice()
  }
}

function handleStartCategory() {
  const categoryProgress = state.progress[practiceCategory.value]?.currentIndex || 0
  if (categoryProgress > 0) {
    showContinueDialog.value = true
  } else {
    startPractice()
  }
}

function continuePractice() {
  showContinueDialog.value = false
  startPractice()
}

function restartPractice() {
  showContinueDialog.value = false
  if (isSequential.value) {
    updateProgress('sequential', 0)
  } else if (practiceCategory.value) {
    updateProgress(practiceCategory.value, 0)
  }
  startPractice(0)
}

function goHome() {
  router.push('/')
}

function selectOption(index) {
  if (showAnswer.value) return
  selectedOptions.value = [index]
  if (currentQuestion.value.type !== 'short_answer') {
    setTimeout(() => {
      showAnswer.value = true
      const isCorrect = isCorrectOption(index)
      addRecord({
        questionId: currentQuestion.value.id,
        type: currentQuestion.value.type,
        userAnswer: [index],
        isCorrect
      })
      if (!isCorrect) {
        addWrongQuestion(currentQuestion.value.id, [index])
      }
    }, 300)
  }
}

function toggleOption(index) {
  if (showAnswer.value) return
  const idx = selectedOptions.value.indexOf(index)
  if (idx > -1) {
    selectedOptions.value.splice(idx, 1)
  } else {
    selectedOptions.value.push(index)
  }
}

function submitMultipleChoiceAnswer() {
  if (showAnswer.value || selectedOptions.value.length === 0) return
  showAnswer.value = true
  
  const answer = currentQuestion.value.answer
  const letters = ['A', 'B', 'C', 'D']
  const correctLetters = Array.isArray(answer) ? answer : [answer]
  const selectedLetters = selectedOptions.value.map(i => letters[i])
  
  const isCorrect = correctLetters.length === selectedLetters.length && 
                    correctLetters.every(l => selectedLetters.includes(l))
  
  addRecord({
    questionId: currentQuestion.value.id,
    type: currentQuestion.value.type,
    userAnswer: selectedOptions.value,
    isCorrect
  })
  
  if (!isCorrect) {
    addWrongQuestion(currentQuestion.value.id, [...selectedOptions.value])
  }
}

function submitFillBlankAnswer() {
  if (showAnswer.value) return
  showAnswer.value = true
  
  let correctAnswers = []
  if (currentQuestion.value.blanks) {
    correctAnswers = currentQuestion.value.blanks.map(b => b.answer)
  } else if (Array.isArray(currentQuestion.value.answer)) {
    correctAnswers = currentQuestion.value.answer
  } else if (currentQuestion.value.answer) {
    correctAnswers = [currentQuestion.value.answer]
  }
  
  const isCorrect = correctAnswers.length === userAnswers.value.length &&
                    correctAnswers.every((ans, idx) => 
                      ans && userAnswers.value[idx] && 
                      ans.toLowerCase() === userAnswers.value[idx].trim().toLowerCase()
                    )
  
  addRecord({
    questionId: currentQuestion.value.id,
    type: currentQuestion.value.type,
    userAnswer: userAnswers.value,
    isCorrect
  })
  
  if (!isCorrect) {
    addWrongQuestion(currentQuestion.value.id, [...userAnswers.value])
  }
}

function isBlankCorrect(index) {
  if (!showAnswer.value) return false
  let correctAnswers = []
  if (currentQuestion.value?.blanks) {
    correctAnswers = currentQuestion.value.blanks.map(b => b.answer)
  } else if (Array.isArray(currentQuestion.value?.answer)) {
    correctAnswers = currentQuestion.value.answer
  } else if (currentQuestion.value?.answer) {
    correctAnswers = [currentQuestion.value.answer]
  }
  const userAnswer = userAnswers.value[index] || ''
  const correctAnswer = correctAnswers[index] || ''
  return userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()
}

function isCorrectOption(index) {
  const answer = currentQuestion.value.answer
  if (currentQuestion.value.type === 'true_false') {
    return (index === 0 && answer === true) || (index === 1 && answer === false)
  }
  const letters = ['A', 'B', 'C', 'D']
  const correctLetters = Array.isArray(answer) ? answer : [answer]
  return correctLetters.includes(letters[index])
}

function formatAnswer(answer) {
  if (currentQuestion.value?.type === 'fill_blank') {
    let answers = []
    if (currentQuestion.value.blanks) {
      answers = currentQuestion.value.blanks.map(b => b.answer)
    } else if (Array.isArray(currentQuestion.value.answer)) {
      answers = currentQuestion.value.answer
    } else if (currentQuestion.value.answer) {
      answers = [currentQuestion.value.answer]
    }
    return answers.join('、')
  }
  if (currentQuestion.value?.type === 'true_false') {
    return answer ? '正确' : '错误'
  }
  if (Array.isArray(answer)) return answer.join('、')
  return answer
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetState()
  }
}

function nextQuestion() {
  if (currentIndex.value < questionList.value.length - 1) {
    currentIndex.value++
    resetState()
    
    if (isSequential.value) {
      updateProgress('sequential', currentIndex.value)
    } else if (practiceCategory.value) {
      updateProgress(currentQuestion.value.type, currentIndex.value)
    }
  } else {
    if (isRandom.value) {
      showRandomComplete.value = true
    } else {
      router.push('/')
    }
  }
}

function resetState() {
  selectedOptions.value = []
  userAnswers.value = []
  showAnswer.value = false
  blanks.value = []
  
  if (currentQuestion.value?.type === 'fill_blank') {
    if (currentQuestion.value.blanks) {
      blanks.value = currentQuestion.value.blanks.map(b => ({ answer: b.answer }))
    } else if (Array.isArray(currentQuestion.value.answer)) {
      blanks.value = currentQuestion.value.answer.map(a => ({ answer: a }))
    } else if (currentQuestion.value.answer) {
      blanks.value = [{ answer: currentQuestion.value.answer }]
    }
    userAnswers.value = new Array(blanks.value.length).fill('')
  }
}

function handleToggleFavorite() {
  if (currentQuestion.value) {
    toggleFavorite(currentQuestion.value.id)
  }
}

onMounted(() => {
  if (isRandom.value) {
    startPractice()
  }
})

onUnmounted(() => {
  if (isStarted.value && currentIndex.value > 0) {
    if (isSequential.value) {
      updateProgress('sequential', currentIndex.value)
    } else if (practiceCategory.value) {
      updateProgress(practiceCategory.value, currentIndex.value)
    }
  }
})

watch(currentQuestion, () => {
  resetState()
})
</script>
