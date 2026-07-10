<template>
  <div class="page-container" style="padding-bottom: 80px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <button @click="goBack" style="font-size: 14px; color: #666;">← 返回</button>
      <h2 style="color: #2E7D32; font-size: 18px; font-weight: 600;">错题练习</h2>
      <div style="font-size: 14px; color: #666;">{{ currentIndex + 1 }}/{{ practiceList.length }}</div>
    </div>
    
    <div v-if="practiceList.length === 0" class="card" style="text-align: center; padding: 40px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
      <div style="font-size: 16px; color: #666;">太棒了！所有错题都已掌握</div>
      <button @click="goBack" style="margin-top: 16px; padding: 10px 24px; background-color: #2E7D32; color: white; border-radius: 8px; border: none;">返回错题集</button>
    </div>
    
    <div v-else>
      <div class="card" style="margin-bottom: 12px;">
        <div style="font-size: 14px; color: #666; margin-bottom: 12px;">{{ categories[currentQuestion?.type]?.name }}</div>
        
        <div style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 16px;">{{ currentQuestion?.question }}</div>
        
        <div v-if="currentQuestion?.type === 'single_choice'" style="margin-bottom: 16px;">
          <div 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            @click="selectOption(index)"
            :style="{
              padding: '14px 16px',
              border: '1px solid',
              borderColor: showAnswer && isCorrectOption(index) ? '#43A047' : (showAnswer && selectedOptions.includes(index) && !isCorrectOption(index) ? '#E53935' : (selectedOptions.includes(index) ? '#2E7D32' : '#E0E0E0')),
              borderRadius: '8px',
              marginBottom: '10px',
              backgroundColor: showAnswer && isCorrectOption(index) ? '#C8E6C9' : (showAnswer && selectedOptions.includes(index) && !isCorrectOption(index) ? '#FFCDD2' : (selectedOptions.includes(index) ? '#C8E6C9' : 'white')),
              cursor: showAnswer ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }"
          >
            <span style="font-weight: 600; margin-right: 12px; color: #666;">{{ ['A', 'B', 'C', 'D'][index] }}.</span>
            <span>{{ option.replace(/^[ABCD]\.\s*/, '') }}</span>
          </div>
        </div>
        
        <div v-else-if="currentQuestion?.type === 'multiple_choice'" style="margin-bottom: 16px;">
          <div v-if="!showAnswer" style="font-size: 16px; color: #E53935; margin-bottom: 12px; font-weight: 500;">提示：多选题最少选两个以上答案</div>
          <div v-if="!showAnswer && selectedOptions.length === 1" style="font-size: 14px; color: #E53935; margin-bottom: 12px;">请至少选择两个答案</div>
          <div 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            @click="toggleOption(index)"
            :style="{
              padding: '14px 16px',
              border: '1px solid',
              borderColor: showAnswer && isCorrectOption(index) ? '#43A047' : (showAnswer && selectedOptions.includes(index) && !isCorrectOption(index) ? '#E53935' : (selectedOptions.includes(index) ? '#2E7D32' : '#E0E0E0')),
              borderRadius: '8px',
              marginBottom: '10px',
              backgroundColor: showAnswer && isCorrectOption(index) ? '#C8E6C9' : (showAnswer && selectedOptions.includes(index) && !isCorrectOption(index) ? '#FFCDD2' : (selectedOptions.includes(index) ? '#C8E6C9' : 'white')),
              cursor: showAnswer ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }"
          >
            <span style="font-weight: 600; margin-right: 12px; color: #666;">{{ ['A', 'B', 'C', 'D'][index] }}.</span>
            <span>{{ option.replace(/^[ABCD]\.\s*/, '') }}</span>
          </div>
          <button 
            v-if="!showAnswer && selectedOptions.length >= 2"
            @click="submitAnswer"
            style="width: 100%; background-color: #2E7D32; color: white; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: 500; border: none; margin-top: 12px;"
          >确认答案</button>
        </div>
        
        <div v-else-if="currentQuestion?.type === 'true_false'" style="margin-bottom: 16px;">
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
        
        <div v-else-if="currentQuestion?.type === 'fill_blank'" style="margin-bottom: 16px;">
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
        
        <div v-if="showAnswer && (currentQuestion?.type === 'single_choice' || currentQuestion?.type === 'multiple_choice' || currentQuestion?.type === 'true_false' || currentQuestion?.type === 'fill_blank')" class="answer-card">
          <div class="answer-card-title">答案：{{ formatAnswer(currentQuestion) }}</div>
          <div v-if="currentQuestion?.explanation" style="margin-top: 8px;">
            <div style="font-weight: 500; color: #2E7D32; margin-bottom: 4px;">解析：</div>
            <div class="answer-card-content">{{ currentQuestion.explanation }}</div>
          </div>
        </div>
        
        <div v-if="showAnswer" style="display: flex; gap: 12px; margin-top: 16px;">
          <button 
            @click="prevQuestion"
            :disabled="currentIndex === 0"
            :style="{
              flex: 1,
              padding: '12px',
              border: '1px solid',
              borderColor: currentIndex === 0 ? '#E0E0E0' : '#2E7D32',
              borderRadius: '8px',
              backgroundColor: currentIndex === 0 ? '#F5F5F5' : 'white',
              color: currentIndex === 0 ? '#999' : '#2E7D32',
              fontSize: '16px',
              fontWeight: '500'
            }"
          >上一题</button>
          <button 
            @click="nextQuestion"
            :style="{
              flex: 1,
              padding: '12px',
              backgroundColor: '#2E7D32',
              color: 'white',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              border: 'none'
            }"
          >{{ currentIndex === practiceList.length - 1 ? '完成练习' : '下一题' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../store'

const router = useRouter()
const { categories, state, getQuestionById, removeWrongQuestion, addRecord } = useStore()

const currentIndex = ref(0)
const selectedOptions = ref([])
const userAnswers = ref([])
const showAnswer = ref(false)
const blanks = ref([])
const practiceList = ref([])

const currentQuestion = computed(() => {
  return practiceList.value[currentIndex.value]?.question
})

function goBack() {
  router.push('/wrong')
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

function selectOption(index) {
  if (showAnswer.value) return
  selectedOptions.value = [index]
  showAnswer.value = true
  
  const isCorrect = isCorrectOption(index)
  
  addRecord({
    questionId: currentQuestion.value.id,
    type: currentQuestion.value.type,
    userAnswer: [index],
    isCorrect
  })
  
  if (isCorrect) {
    practiceList.value[currentIndex.value].mastered = true
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

function submitAnswer() {
  if (showAnswer.value) return
  showAnswer.value = true
  
  const answer = currentQuestion.value.answer
  const correctAnswers = Array.isArray(answer) ? answer : [answer]
  const correctIndices = correctAnswers.map(a => ['A', 'B', 'C', 'D'].indexOf(a)).filter(i => i >= 0)
  
  const isCorrect = correctIndices.length === selectedOptions.value.length &&
                    correctIndices.every(idx => selectedOptions.value.includes(idx)) &&
                    selectedOptions.value.every(idx => correctIndices.includes(idx))
  
  addRecord({
    questionId: currentQuestion.value.id,
    type: currentQuestion.value.type,
    userAnswer: [...selectedOptions.value],
    isCorrect
  })
  
  if (isCorrect) {
    practiceList.value[currentIndex.value].mastered = true
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
    userAnswer: [...userAnswers.value],
    isCorrect
  })
  
  if (isCorrect) {
    practiceList.value[currentIndex.value].mastered = true
  }
}

function isCorrectOption(index) {
  const answer = currentQuestion.value.answer
  if (currentQuestion.value.type === 'true_false') {
    const isTrue = answer === true || answer === 'true' || answer === '正确' || answer === '对' || answer === 'A'
    return (index === 0 && isTrue) || (index === 1 && !isTrue)
  }
  const letters = ['A', 'B', 'C', 'D']
  const correctLetters = Array.isArray(answer) ? answer : [answer]
  return correctLetters.includes(letters[index])
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

function formatAnswer(q) {
  if (q.type === 'fill_blank') {
    let answers = []
    if (q.blanks) {
      answers = q.blanks.map(b => b.answer)
    } else if (Array.isArray(q.answer)) {
      answers = q.answer
    } else if (q.answer) {
      answers = [q.answer]
    }
    return answers.join('、')
  }
  if (q.type === 'true_false') {
    const isTrue = q.answer === true || q.answer === 'true' || q.answer === '正确' || q.answer === '对' || q.answer === 'A'
    return isTrue ? '正确' : '错误'
  }
  if (Array.isArray(q.answer)) return q.answer.join('、')
  return q.answer
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetState()
  }
}

function nextQuestion() {
  if (practiceList.value.length === 0) {
    goBack()
    return
  }
  
  if (currentIndex.value < practiceList.value.length - 1) {
    currentIndex.value++
    resetState()
  } else {
    practiceList.value.forEach(item => {
      if (item.mastered) {
        removeWrongQuestion(item.questionId)
      }
    })
    goBack()
  }
}

watch(currentIndex, () => {
  resetState()
})

onMounted(() => {
  practiceList.value = state.wrongQuestions.map(item => ({
    ...item,
    question: getQuestionById(item.questionId),
    mastered: false
  })).filter(item => item.question)
  
  if (practiceList.value.length === 0) {
    goBack()
  } else {
    resetState()
  }
})
</script>

<style scoped>
.answer-card {
  padding: 12px;
  background-color: #E8F5E9;
  border-radius: 8px;
  margin-top: 16px;
}

.answer-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2E7D32;
}

.answer-card-content {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}
</style>