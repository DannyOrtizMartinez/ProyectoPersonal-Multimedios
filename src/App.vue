<script setup>
import { ref } from 'vue'
import StartScreen from './components/StartScreen.vue'
import GameScreen from './components/GameScreen.vue'
import ResultScreen from './components/ResultScreen.vue'

const pantallaActual = ref('start')
</script>

<template>
  <div class="app-container">
    <StartScreen v-if="pantallaActual === 'start'" @cambiar-pantalla="pantallaActual = $event" />
    <GameScreen v-else-if="pantallaActual === 'game'" @cambiar-pantalla="pantallaActual = $event" />
    <ResultScreen v-else-if="pantallaActual === 'result'" @cambiar-pantalla="pantallaActual = $event" />
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  color: #333;
  overflow: hidden;
}
</style>
