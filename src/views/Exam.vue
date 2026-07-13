<template>
  <div class="page-container" style="padding-bottom: 80px;">
    <div v-if="!isStarted">
      <div class="card">
        <h2 style="color: #2E7D32; font-size: 18px; font-weight: 600; margin-bottom: 16px;">模拟考试</h2>
        
        <div style="margin-bottom: 20px; padding: 16px; background-color: #F5F5F5; border-radius: 8px;">
          <div style="font-size: 14px; color: #666; margin-bottom: 8px;">考试规则：</div>
          <ul style="font-size: 13px; color: #333; line-height: 1.8; padding-left: 20px;">
            <li>考试时长：90分钟</li>
            <li>单选题：20题，每题2分</li>
            <li>多选题：10题，每题3分</li>
            <li>判断题：10题，每题1分</li>
            <li>填空题：10题，每题2分</li>
            <li>总计：100分</li>
          </ul>
        </div>
        
        <button 
          @click="startExam" 
          style="width: 100%; background-color: #2E7D32; color: white; padding: 14px; border-radius: 8px; font-size: 16px; font-weight: 500; border: none;"
        >开始考试</button>
      </div>
    </div>
    
    <div v-else-if="!isFinished && currentQuestion">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div :class="['timer', timerClass]" style="font-size: 20px; font-weight: 600;">{{ formatTime(remainingTime) }}</div>
        <button @click="showSheet = !showSheet" style="padding: 8px 16px; border: 1px solid #2E7D32; border-radius: 8px; font-size: 14px; color: #2E7D32;">答题卡</button>
      </div>
      
      <div v-if="showSheet" class="card" style="margin-bottom: 16px;">
        <div style="font-size: 14px; color: #666; margin-bottom: 12px;">答题卡</div>
        <div class="exam-sheet">
          <div 
            v-for="(q, index) in examQuestions" 
            :key="index"
            @click="goToQuestion(index)"
            :class="[
              'exam-sheet-item',
              { 'current': currentIndex === index, 'answered': answers[index] }
            ]"
          >{{ index + 1 }}</div>
        </div>
      </div>
      
      <div class="card">
        <div style="font-size: 14px; color: #666; margin-bottom: 16px;">{{ categoryName }} 第 {{ currentIndex + 1 }}/{{ examQuestions.length }} 题</div>
        
        <div style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">{{ currentQuestion.question }}</div>
        
        <div v-if="currentQuestion.type === 'single_choice'" style="margin-bottom: 16px;">
          <div 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            @click="selectAnswer(index)"
            :style="{
              padding: '14px 16px',
              border: '1px solid',
              borderColor: showAnswer && isCorrectOption(index) ? '#43A047' : (showAnswer && answers[currentIndex] === index && !isCorrectOption(index) ? '#E53935' : (answers[currentIndex] === index ? '#2E7D32' : '#E0E0E0')),
              borderRadius: '8px',
              marginBottom: '10px',
              backgroundColor: showAnswer && isCorrectOption(index) ? '#C8E6C9' : (showAnswer && answers[currentIndex] === index && !isCorrectOption(index) ? '#FFCDD2' : (answers[currentIndex] === index ? '#C8E6C9' : 'white')),
              cursor: showAnswer ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }"
          >
            <span style="font-weight: 600; margin-right: 12px; color: #666;">{{ ['A', 'B', 'C', 'D', 'E'][index] }}.</span>
            <span>{{ option.replace(/^[ABCDE]\.\s*/, '') }}</span>
          </div>
        </div>
        
        <div v-else-if="currentQuestion.type === 'multiple_choice'" style="margin-bottom: 16px;">
          <div v-if="!showAnswer" style="font-size: 16px; color: #E53935; margin-bottom: 12px; font-weight: 500;">提示：多选题最少选两个以上答案</div>
          <div v-if="!showAnswer && getCurrentAnswerCount() === 1" style="font-size: 14px; color: #E53935; margin-bottom: 12px;">请至少选择两个答案</div>
          <div 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            @click="toggleAnswer(index)"
            :style="{
              padding: '14px 16px',
              border: '1px solid',
              borderColor: showAnswer && isCorrectOption(index) ? '#43A047' : (showAnswer && isAnswerSelected(index) && !isCorrectOption(index) ? '#E53935' : (isAnswerSelected(index) ? '#2E7D32' : '#E0E0E0')),
              borderRadius: '8px',
              marginBottom: '10px',
              backgroundColor: showAnswer && isCorrectOption(index) ? '#C8E6C9' : (showAnswer && isAnswerSelected(index) && !isCorrectOption(index) ? '#FFCDD2' : (isAnswerSelected(index) ? '#C8E6C9' : 'white')),
              cursor: showAnswer ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }"
          >
            <span style="font-weight: 600; margin-right: 12px; color: #666;">{{ ['A', 'B', 'C', 'D', 'E'][index] }}.</span>
            <span>{{ option.replace(/^[ABCDE]\.\s*/, '') }}</span>
          </div>
          <button 
            v-if="!showAnswer && getCurrentAnswerCount() >= 2"
            @click="submitAnswer"
            style="width: 100%; background-color: #2E7D32; color: white; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: 500; border: none; margin-top: 12px;"
          >确认答案</button>
        </div>
        
        <div v-else-if="currentQuestion.type === 'true_false'" style="margin-bottom: 16px;">
          <div style="display: flex; gap: 12px;">
            <button 
              @click="selectAnswer(0)"
              :disabled="showAnswer"
              :style="{
                flex: 1,
                padding: '16px',
                border: '1px solid',
                borderColor: showAnswer && !isCorrectOption(0) && answers[currentIndex] === 0 ? '#E53935' : (showAnswer && isCorrectOption(0) ? '#43A047' : (answers[currentIndex] === 0 ? '#2E7D32' : '#E0E0E0')),
                borderRadius: '8px',
                backgroundColor: showAnswer && !isCorrectOption(0) && answers[currentIndex] === 0 ? '#FFCDD2' : (showAnswer && isCorrectOption(0) ? '#C8E6C9' : (answers[currentIndex] === 0 ? '#C8E6C9' : 'white')),
                fontSize: '16px',
                color: '#333',
                cursor: showAnswer ? 'default' : 'pointer'
              }"
            >正确</button>
            <button 
              @click="selectAnswer(1)"
              :disabled="showAnswer"
              :style="{
                flex: 1,
                padding: '16px',
                border: '1px solid',
                borderColor: showAnswer && !isCorrectOption(1) && answers[currentIndex] === 1 ? '#E53935' : (showAnswer && isCorrectOption(1) ? '#43A047' : (answers[currentIndex] === 1 ? '#2E7D32' : '#E0E0E0')),
                borderRadius: '8px',
                backgroundColor: showAnswer && !isCorrectOption(1) && answers[currentIndex] === 1 ? '#FFCDD2' : (showAnswer && isCorrectOption(1) ? '#C8E6C9' : (answers[currentIndex] === 1 ? '#C8E6C9' : 'white')),
                fontSize: '16px',
                color: '#333',
                cursor: showAnswer ? 'default' : 'pointer'
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
        
        <div v-if="showAnswer && (currentQuestion.type === 'single_choice' || currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false' || currentQuestion.type === 'fill_blank')" class="answer-card">
          <div class="answer-card-title">答案：{{ formatAnswer(currentQuestion) }}</div>
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
          >{{ currentIndex === examQuestions.length - 1 ? '交卷' : '下一题' }}</button>
        </div>
      </div>
    </div>
    
    <div v-else-if="isFinished">
      <div class="card" style="margin-bottom: 16px;">
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; font-weight: 700; color: #2E7D32; margin-bottom: 16px;">{{ score }}</div>
          <div style="font-size: 16px; color: #666; margin-bottom: 24px;">考试得分</div>
          
          <div style="display: flex; justify-content: space-around; margin-bottom: 24px;">
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: 600; color: #333;">{{ correctCount }}</div>
              <div style="font-size: 12px; color: #666;">答对</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: 600; color: #E53935;">{{ examQuestions.length - correctCount }}</div>
              <div style="font-size: 12px; color: #666;">答错</div>
            </div>
          </div>
          
          <button 
            @click="showAnswers = !showAnswers" 
            style="width: 100%; background-color: #2E7D32; color: white; padding: 14px; border-radius: 8px; font-size: 16px; font-weight: 500; border: none; margin-bottom: 12px;"
          >{{ showAnswers ? '隐藏答案' : '查看答案' }}</button>
          
          <button 
            @click="router.push('/')" 
            style="width: 100%; border: 1px solid #2E7D32; color: #2E7D32; padding: 14px; border-radius: 8px; font-size: 16px; font-weight: 500; background-color: white;"
          >返回首页</button>
        </div>
      </div>
      
      <div v-if="showAnswers">
        <div 
          v-for="(q, index) in examQuestions" 
          :key="index"
          class="card"
          style="margin-bottom: 16px;"
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="font-size: 14px; color: #666;">{{ categories[q.type]?.name }} 第 {{ index + 1 }} 题</div>
            <div :style="{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: getQuestionResult(index).isCorrect ? '#43A047' : '#E53935'
            }">
              {{ getQuestionResult(index).isCorrect ? '正确' : '错误' }}
            </div>
          </div>
          
          <div style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">{{ q.question }}</div>
          
          <div v-if="q.options" style="margin-bottom: 16px;">
            <div 
              v-for="(option, optIndex) in q.options" 
              :key="optIndex"
              :style="{
                padding: '10px 14px',
                border: '1px solid',
                borderColor: getOptionColor(q, index, optIndex),
                borderRadius: '6px',
                marginBottom: '8px',
                backgroundColor: getOptionBgColor(q, index, optIndex),
                fontSize: '14px'
              }"
            >
              <span style="font-weight: 600; margin-right: 8px;">{{ ['A', 'B', 'C', 'D', 'E'][optIndex] }}.</span>
              <span>{{ option.replace(/^[ABCDE]\.\s*/, '') }}</span>
            </div>
          </div>
          
          <div style="padding: 12px; background-color: #E8F5E9; border-radius: 8px;">
            <div style="font-size: 14px; font-weight: 600; color: #2E7D32; margin-bottom: 8px;">答案：{{ formatAnswer(q) }}</div>
            <div v-if="q.explanation" style="font-size: 14px; color: #555; line-height: 1.6;">解析：{{ q.explanation }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../store'

const router = useRouter()
const { categories, getQuestionsByCategory, addRecord, addWrongQuestion } = useStore()

const isStarted = ref(false)
const isFinished = ref(false)
const examQuestions = ref([])
const currentIndex = ref(0)
const answers = ref({})
const userAnswers = ref([])
const remainingTime = ref(90 * 60)
const showSheet = ref(false)
const showAnswers = ref(false)
const showAnswer = ref(false)
const blanks = ref([])
let timer = null

const currentQuestion = computed(() => examQuestions.value[currentIndex.value])

const categoryName = computed(() => {
  if (!currentQuestion.value) return ''
  return categories[currentQuestion.value.type]?.name || ''
})

const timerClass = computed(() => {
  if (remainingTime.value <= 60) return 'danger'
  if (remainingTime.value <= 300) return 'warning'
  return ''
})

const score = computed(() => {
  let total = 0
  examQuestions.value.forEach((q, index) => {
    const userAnswer = answers.value[index]
    if (userAnswer === undefined || userAnswer === null) return
    
    let isCorrect = false
    const correctAnswer = q.answer
    const letters = ['A', 'B', 'C', 'D', 'E']
    
    if (q.type === 'fill_blank') {
      const answer = q.blanks || q.answer
      const correctAnswers = Array.isArray(answer) ? answer : [answer]
      isCorrect = correctAnswers.length === userAnswer.length &&
                  correctAnswers.every((ans, idx) => 
                    ans && userAnswer[idx] && 
                    ans.toLowerCase() === userAnswer[idx].trim().toLowerCase()
                  )
    } else if (q.type === 'multiple_choice') {
      const correctLetters = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]
      const selectedLetters = Array.isArray(userAnswer) ? userAnswer.map(i => letters[i]) : [letters[userAnswer]]
      isCorrect = correctLetters.length === selectedLetters.length && 
                  correctLetters.every(l => selectedLetters.includes(l))
    } else if (q.type === 'true_false') {
      isCorrect = (userAnswer === 0 && correctAnswer === true) || (userAnswer === 1 && correctAnswer === false)
    } else {
      const correctIndex = letters.indexOf(correctAnswer)
      isCorrect = userAnswer === correctIndex
    }
    
    if (isCorrect) {
      if (q.type === 'single_choice') total += 2
      else if (q.type === 'multiple_choice') total += 3
      else if (q.type === 'true_false') total += 1
      else if (q.type === 'fill_blank') total += 2
    }
  })
  return total
})

const correctCount = computed(() => {
  let count = 0
  examQuestions.value.forEach((q, index) => {
    const userAnswer = answers.value[index]
    if (userAnswer === undefined || userAnswer === null) return
    
    let isCorrect = false
    const correctAnswer = q.answer
    const letters = ['A', 'B', 'C', 'D', 'E']
    
    if (q.type === 'fill_blank') {
      const answer = q.blanks || q.answer
      const correctAnswers = Array.isArray(answer) ? answer : [answer]
      isCorrect = correctAnswers.length === userAnswer.length &&
                  correctAnswers.every((ans, idx) => 
                    ans && userAnswer[idx] && 
                    ans.toLowerCase() === userAnswer[idx].trim().toLowerCase()
                  )
    } else if (q.type === 'multiple_choice') {
      const correctLetters = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]
      const selectedLetters = Array.isArray(userAnswer) ? userAnswer.map(i => letters[i]) : [letters[userAnswer]]
      isCorrect = correctLetters.length === selectedLetters.length && 
                  correctLetters.every(l => selectedLetters.includes(l))
    } else if (q.type === 'true_false') {
      isCorrect = (userAnswer === 0 && correctAnswer === true) || (userAnswer === 1 && correctAnswer === false)
    } else {
      const correctIndex = letters.indexOf(correctAnswer)
      isCorrect = userAnswer === correctIndex
    }
    
    if (isCorrect) count++
  })
  return count
})

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function getQuestionResult(index) {
  const q = examQuestions.value[index]
  const userAnswer = answers.value[index]
  if (userAnswer === undefined || userAnswer === null) {
    return { isCorrect: false, userAnswer: null }
  }
  
  const correctAnswer = q.answer
  const letters = ['A', 'B', 'C', 'D', 'E']
  
  if (q.type === 'multiple_choice') {
    const correctLetters = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]
    const selectedLetters = Array.isArray(userAnswer) ? userAnswer.map(i => letters[i]) : [letters[userAnswer]]
    return {
      isCorrect: correctLetters.length === selectedLetters.length && 
                 correctLetters.every(l => selectedLetters.includes(l)),
      userAnswer
    }
  } else if (q.type === 'true_false') {
    return {
      isCorrect: (userAnswer === 0 && correctAnswer === true) || (userAnswer === 1 && correctAnswer === false),
      userAnswer
    }
  } else {
    const correctIndex = letters.indexOf(correctAnswer)
    return {
      isCorrect: userAnswer === correctIndex,
      userAnswer
    }
  }
}

function getOptionColor(q, index, optIndex) {
  const result = getQuestionResult(index)
  const letters = ['A', 'B', 'C', 'D', 'E']
  
  if (q.type === 'multiple_choice') {
    const correctLetters = Array.isArray(q.answer) ? q.answer : [q.answer]
    const isCorrect = correctLetters.includes(letters[optIndex])
    const isSelected = (result.userAnswer || []).includes(optIndex)
    
    if (isCorrect && isSelected) return '#43A047'
    if (isCorrect && !isSelected) return '#43A047'
    if (!isCorrect && isSelected) return '#E53935'
    return '#E0E0E0'
  } else if (q.type === 'true_false') {
    const isTrue = q.answer === true || q.answer === 'true' || q.answer === '正确' || q.answer === '对' || q.answer === 'A'
    const isCorrectOption = (optIndex === 0 && isTrue) || (optIndex === 1 && !isTrue)
    const isSelected = result.userAnswer === optIndex
    
    if (isCorrectOption && isSelected) return '#43A047'
    if (isCorrectOption && !isSelected) return '#43A047'
    if (!isCorrectOption && isSelected) return '#E53935'
    return '#E0E0E0'
  } else {
    const correctIndex = letters.indexOf(q.answer)
    const isCorrect = optIndex === correctIndex
    const isSelected = result.userAnswer === optIndex
    
    if (isCorrect && isSelected) return '#43A047'
    if (isCorrect && !isSelected) return '#43A047'
    if (!isCorrect && isSelected) return '#E53935'
    return '#E0E0E0'
  }
}

function getOptionBgColor(q, index, optIndex) {
  const result = getQuestionResult(index)
  const letters = ['A', 'B', 'C', 'D', 'E']
  
  if (q.type === 'multiple_choice') {
    const correctLetters = Array.isArray(q.answer) ? q.answer : [q.answer]
    const isCorrect = correctLetters.includes(letters[optIndex])
    const isSelected = (result.userAnswer || []).includes(optIndex)
    
    if (isCorrect && isSelected) return '#C8E6C9'
    if (isCorrect && !isSelected) return '#E8F5E9'
    if (!isCorrect && isSelected) return '#FFCDD2'
    return 'white'
  } else if (q.type === 'true_false') {
    const isTrue = q.answer === true || q.answer === 'true' || q.answer === '正确' || q.answer === '对' || q.answer === 'A'
    const isCorrectOption = (optIndex === 0 && isTrue) || (optIndex === 1 && !isTrue)
    const isSelected = result.userAnswer === optIndex
    
    if (isCorrectOption && isSelected) return '#C8E6C9'
    if (isCorrectOption && !isSelected) return '#E8F5E9'
    if (!isCorrectOption && isSelected) return '#FFCDD2'
    return 'white'
  } else {
    const correctIndex = letters.indexOf(q.answer)
    const isCorrect = optIndex === correctIndex
    const isSelected = result.userAnswer === optIndex
    
    if (isCorrect && isSelected) return '#C8E6C9'
    if (isCorrect && !isSelected) return '#E8F5E9'
    if (!isCorrect && isSelected) return '#FFCDD2'
    return 'white'
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

function isCorrectOption(index) {
  const q = currentQuestion.value
  if (!q) return false
  
  if (q.type === 'true_false') {
    const isTrue = q.answer === true || q.answer === 'true' || q.answer === '正确' || q.answer === '对' || q.answer === 'A'
    return (index === 0 && isTrue) || (index === 1 && !isTrue)
  }
  
  const answer = q.answer
  const letters = ['A', 'B', 'C', 'D', 'E']
  const correctLetters = Array.isArray(answer) ? answer : [answer]
  return correctLetters.includes(letters[index])
}

function getCurrentAnswerCount() {
  const current = answers.value[currentIndex.value] || []
  return Array.isArray(current) ? current.length : 1
}

function startExam() {
  const singleChoice = getQuestionsByCategory('single_choice')
  const multipleChoice = getQuestionsByCategory('multiple_choice')
  const trueFalse = getQuestionsByCategory('true_false')
  const fillBlank = getQuestionsByCategory('fill_blank')
  
  const shuffledSingle = singleChoice.sort(() => Math.random() - 0.5).slice(0, 20)
  const shuffledMultiple = multipleChoice.sort(() => Math.random() - 0.5).slice(0, 10)
  const shuffledTrueFalse = trueFalse.sort(() => Math.random() - 0.5).slice(0, 10)
  const shuffledFillBlank = fillBlank.sort(() => Math.random() - 0.5).slice(0, 10)
  
  examQuestions.value = [...shuffledSingle, ...shuffledMultiple, ...shuffledTrueFalse, ...shuffledFillBlank]
  isStarted.value = true
  currentIndex.value = 0
  resetQuestionState()
  
  timer = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      finishExam()
    }
  }, 1000)
}

function selectAnswer(index) {
  if (showAnswer.value) return
  answers.value[currentIndex.value] = index
  
  const q = currentQuestion.value
  if (q && q.type !== 'fill_blank' && q.type !== 'multiple_choice') {
    setTimeout(() => {
      showAnswer.value = true
    }, 300)
  }
}

function toggleAnswer(index) {
  if (showAnswer.value) return
  const current = answers.value[currentIndex.value] || []
  const idx = current.indexOf(index)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    current.push(index)
  }
  answers.value[currentIndex.value] = [...current]
}

function isAnswerSelected(index) {
  const current = answers.value[currentIndex.value] || []
  return current.includes(index)
}

function submitAnswer() {
  showAnswer.value = true
}

function submitFillBlankAnswer() {
  showAnswer.value = true
  answers.value[currentIndex.value] = [...userAnswers.value]
}

function resetQuestionState() {
  showAnswer.value = false
  userAnswers.value = []
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

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    showSheet.value = false
    resetQuestionState()
  }
}

function nextQuestion() {
  if (currentIndex.value < examQuestions.value.length - 1) {
    currentIndex.value++
    showSheet.value = false
    resetQuestionState()
  } else {
    finishExam()
  }
}

watch(currentQuestion, () => {
  resetQuestionState()
})

function goToQuestion(index) {
  currentIndex.value = index
  showSheet.value = false
}

function finishExam() {
  clearInterval(timer)
  isFinished.value = true
  
  examQuestions.value.forEach((q, index) => {
    const userAnswer = answers.value[index]
    if (userAnswer === undefined || userAnswer === null) return
    
    let isCorrect = false
    const correctAnswer = q.answer
    const letters = ['A', 'B', 'C', 'D', 'E']
    
    if (q.type === 'fill_blank') {
      const answer = q.blanks || q.answer
      const correctAnswers = Array.isArray(answer) ? answer : [answer]
      isCorrect = correctAnswers.length === userAnswer.length &&
                  correctAnswers.every((ans, idx) => 
                    ans && userAnswer[idx] && 
                    ans.toLowerCase() === userAnswer[idx].trim().toLowerCase()
                  )
    } else if (q.type === 'multiple_choice') {
      const correctLetters = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]
      const selectedLetters = Array.isArray(userAnswer) ? userAnswer.map(i => letters[i]) : [letters[userAnswer]]
      isCorrect = correctLetters.length === selectedLetters.length && 
                  correctLetters.every(l => selectedLetters.includes(l))
    } else if (q.type === 'true_false') {
      isCorrect = (userAnswer === 0 && correctAnswer === true) || (userAnswer === 1 && correctAnswer === false)
    } else {
      const correctIndex = letters.indexOf(correctAnswer)
      isCorrect = userAnswer === correctIndex
    }
    
    addRecord({
      questionId: q.id,
      type: q.type,
      userAnswer,
      isCorrect
    })
    
    if (!isCorrect) {
      addWrongQuestion(q.id)
    }
  })
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
