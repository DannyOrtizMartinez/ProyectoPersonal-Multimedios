<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['cambiar-pantalla'])

// Estados de la trivia
const listaPreguntas = ref([])
const indicePregunta = ref(0)

// Estados del jugador
const distancia = ref(0)
const puntos = ref(0)

// Referencias a los audios
const audioAcierto = ref(null)
const audioError = ref(null)
const audioGameOver = ref(null)

// Estados del juego
const anguloRotacion = ref(0)
const juegoPausado = ref(false)
const mostrandoPregunta = ref(false)
const velocidadAnimacion = ref(0.8) // Velocidad base en segundos

let isAccelerating = false
let isBraking = false
let gameLoopId = null
let lastTime = 0
let tiempoAcumuladoPregunta = 0

// Cargar preguntas desde el JSON
const cargarPreguntas = async () => {
  try {
    const respuesta = await fetch('/preguntas.json')
    const datos = await respuesta.json()
    listaPreguntas.value = datos
  } catch (error) {
    console.error('Error al cargar las preguntas:', error)
  }
}

// Controles de teclado
const manejarTeclaDown = (event) => {
  if (event.key === 'Escape') {
    if (mostrandoPregunta.value) return // No pausar si hay modal
    juegoPausado.value = !juegoPausado.value
    if (!juegoPausado.value) {
      lastTime = performance.now()
      gameLoopId = requestAnimationFrame(gameLoop)
    } else {
      cancelAnimationFrame(gameLoopId)
    }
    return
  }

  if (juegoPausado.value) return

  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    isAccelerating = true
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    isBraking = true
  }
}

const manejarTeclaUp = (event) => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    isAccelerating = false
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    isBraking = false
  }
}

// Controles táctiles (Móviles)
const startAccelerate = () => { if(!juegoPausado.value) isAccelerating = true }
const stopAccelerate = () => { isAccelerating = false }
const startBrake = () => { if(!juegoPausado.value) isBraking = true }
const stopBrake = () => { isBraking = false }

// Guardar historial
const registrarAcierto = () => {
  let aciertos = parseInt(localStorage.getItem('respuestasCorrectas') || '0', 10)
  aciertos++
  localStorage.setItem('respuestasCorrectas', aciertos)
}

// Bucle principal del juego
const gameLoop = (timestamp) => {
  if (!lastTime) lastTime = timestamp
  const deltaTime = timestamp - lastTime
  lastTime = timestamp

  if (!juegoPausado.value && !mostrandoPregunta.value) {
    // 1. Aumentar distancia (acelera si va en wheelie)
    const factorVelocidad = velocidadAnimacion.value < 0.8 ? 1.5 : 1
    distancia.value += 5 * factorVelocidad * (deltaTime / 16)
    tiempoAcumuladoPregunta += deltaTime

    // 2. Físicas y Gravedad
    if (isAccelerating) {
      anguloRotacion.value += 1.5 * (deltaTime / 16)
    } else if (isBraking) {
      anguloRotacion.value -= 1.5 * (deltaTime / 16)
    } else {
      // Gravedad: Volver a 0 lentamente
      if (anguloRotacion.value > 0) {
        anguloRotacion.value = Math.max(0, anguloRotacion.value - 1.0 * (deltaTime / 16))
      } else if (anguloRotacion.value < 0) {
        anguloRotacion.value = Math.min(0, anguloRotacion.value + 1.0 * (deltaTime / 16))
      }
    }

    // 3. Velocidad Dinámica (Wheelie > 15 grados)
    if (anguloRotacion.value > 15) {
      velocidadAnimacion.value = Math.max(0.3, velocidadAnimacion.value - 0.01 * (deltaTime / 16))
    } else {
      velocidadAnimacion.value = Math.min(0.8, velocidadAnimacion.value + 0.02 * (deltaTime / 16))
    }

    // 4. Revisar condición de derrota (85 grados o -20 grados)
    if (anguloRotacion.value > 100 || anguloRotacion.value < -20) {
      terminarJuego()
      return 
    }

    // 5. Aparición de preguntas
    if (tiempoAcumuladoPregunta >= 5000 && indicePregunta.value < listaPreguntas.value.length) {
      mostrarPregunta()
      return // Pausar ciclo para la pregunta
    }
  }

  gameLoopId = requestAnimationFrame(gameLoop)
}

const mostrarPregunta = () => {
  mostrandoPregunta.value = true
  tiempoAcumuladoPregunta = 0
  isAccelerating = false
  isBraking = false
  cancelAnimationFrame(gameLoopId) // Detener render temporalmente
}

const verificarRespuesta = (opcionSeleccionada) => {
  const preguntaActual = listaPreguntas.value[indicePregunta.value]
  
  if (opcionSeleccionada === preguntaActual.respuesta_correcta) {
    if (audioAcierto.value) {
      audioAcierto.value.currentTime = 0
      audioAcierto.value.play()
    }
    puntos.value += 100
    registrarAcierto() // Guardar en historial
  } else {
    if (audioError.value) {
      audioError.value.currentTime = 0
      audioError.value.play()
    }
    anguloRotacion.value += 35 // Desestabilizar
  }
  
  mostrandoPregunta.value = false
  lastTime = performance.now()
  gameLoopId = requestAnimationFrame(gameLoop) // Reanudar
  
  if (indicePregunta.value < listaPreguntas.value.length) {
    indicePregunta.value++
  }

  if (anguloRotacion.value > 175 || anguloRotacion.value < -20) {
    terminarJuego()
  }
}

const terminarJuego = () => {
  juegoPausado.value = true
  if (audioGameOver.value) {
    audioGameOver.value.currentTime = 0
    audioGameOver.value.play()
  }
  cancelAnimationFrame(gameLoopId)
  emit('cambiar-pantalla', 'result')
}

onMounted(() => {
  cargarPreguntas()
  window.addEventListener('keydown', manejarTeclaDown)
  window.addEventListener('keyup', manejarTeclaUp)
  
  lastTime = performance.now()
  gameLoopId = requestAnimationFrame(gameLoop)
})

onUnmounted(() => {
  window.removeEventListener('keydown', manejarTeclaDown)
  window.removeEventListener('keyup', manejarTeclaUp)
  cancelAnimationFrame(gameLoopId)
})
</script>

<template>
  <div class="screen endless-runner" :class="{ pausado: juegoPausado || mostrandoPregunta }">
    <!-- UI Superior -->
    <div class="stats">
      <div class="stat-box">Distancia: {{ Math.floor(distancia) }}m</div>
      <div class="stat-box">Puntos: {{ puntos }}</div>
    </div>
    
    <!-- Área de juego -->
    <div class="game-area">
      <!-- Entorno Animado -->
      <div class="sky">
        <div class="cloud" :style="{ animationDuration: `${velocidadAnimacion * 15}s` }">☁️</div>
        <div class="cloud cloud-2" :style="{ animationDuration: `${velocidadAnimacion * 20}s` }">☁️</div>
      </div>

      <div class="scenery-container">
        <div class="scenery" :style="{ animationDuration: `${velocidadAnimacion * 3}s` }">
          🌲 🏢 🌲 🌲 🏢 🌲 🏢 🏢 🌲 🌲 🌲 🏢 🌲 🌲
        </div>
      </div>

      <div class="road-container">
        <div class="road" :style="{ animationDuration: `${velocidadAnimacion}s` }"></div>
      </div>
      
      <!-- Moto -->
      <div class="moto-wrapper">
        <div class="moto-container" :style="{ transform: `rotate(${anguloRotacion}deg)` }">
          <img src="/moto.png" alt="Moto" class="moto-img" />
        </div>
      </div>
    </div>

    <!-- Controles Móviles (Ocultos en Escritorio) -->
    <div class="mobile-controls">
      <button 
        class="ctrl-btn" 
        @touchstart.prevent="startBrake" 
        @touchend.prevent="stopBrake"
        @mousedown="startBrake"
        @mouseup="stopBrake"
        @mouseleave="stopBrake"
      >
        ⬅️
      </button>
      <button 
        class="ctrl-btn" 
        @touchstart.prevent="startAccelerate" 
        @touchend.prevent="stopAccelerate"
        @mousedown="startAccelerate"
        @mouseup="stopAccelerate"
        @mouseleave="stopAccelerate"
      >
        ➡️
      </button>
    </div>

    <!-- Menú de Pausa -->
    <div v-if="juegoPausado && !mostrandoPregunta" class="modal-overlay">
      <div class="pausa-container">
        <h1>PAUSA</h1>
        <p>Presiona ESC para continuar</p>
      </div>
    </div>

    <!-- Modal de Pregunta -->
    <div v-if="mostrandoPregunta && listaPreguntas.length > 0" class="modal-overlay">
      <div class="pregunta-container">
        <h2>{{ listaPreguntas[indicePregunta]?.pregunta }}</h2>
        <div class="opciones">
          <button 
            v-for="(opcion, index) in listaPreguntas[indicePregunta]?.opciones" 
            :key="index"
            class="btn-opcion"
            @click="verificarRespuesta(opcion)"
          >
            {{ opcion }}
          </button>
        </div>
      </div>
    </div>

    <!-- Audios -->
    <audio ref="audioAcierto" src="/acierto.mp3"></audio>
    <audio ref="audioError" src="/error.mp3"></audio>
    <audio ref="audioGameOver" src="/game_over.mp3"></audio>
  </div>
</template>

<style scoped>
.screen.endless-runner {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.stats {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
}

.stat-box {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.2rem;
}

.game-area {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.sky {
  flex: 1;
  background: linear-gradient(to bottom, #87CEEB, #E0F6FF);
  position: relative;
  overflow: hidden;
}

.cloud {
  position: absolute;
  top: 20%;
  right: -100px;
  font-size: 4rem;
  animation: moveLeft linear infinite;
}

.cloud-2 {
  top: 10%;
  font-size: 3rem;
  animation-delay: -5s;
}

.scenery-container {
  height: 60px;
  background: #a8e6cf;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.scenery {
  font-size: 2.5rem;
  white-space: nowrap;
  animation: moveLeft linear infinite;
  padding-bottom: 5px;
}

.road-container {
  height: 120px;
  position: relative;
  background: #555;
  border-top: 6px solid #888;
  overflow: hidden;
}

.road {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background-image: repeating-linear-gradient(
    90deg,
    transparent 0,
    transparent 50px,
    #fff 50px,
    #fff 100px
  );
  background-size: 100px 10px;
  background-position: center 50%;
  background-repeat: repeat-x;
  animation: moveRoad linear infinite;
}

/* Pausar todas las animaciones cuando pausado */
.screen.pausado .road,
.screen.pausado .scenery,
.screen.pausado .cloud {
  animation-play-state: paused !important;
}

@keyframes moveLeft {
  from { transform: translateX(100vw); }
  to { transform: translateX(-200vw); }
}

@keyframes moveRoad {
  from { transform: translateX(0); }
  to { transform: translateX(-100px); }
}

.moto-wrapper {
  position: absolute;
  bottom: 60px;
  left: 20%;
  z-index: 5;
}

.moto-container {
  width: 140px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: bottom center;
}

.moto-img {
  width: 100%;
  height: auto;
  min-height: 80px; 
}

/* Controles Móviles */
.mobile-controls {
  display: none;
  position: absolute;
  bottom: 30px;
  left: 0;
  width: 100%;
  justify-content: space-between;
  padding: 0 30px;
  box-sizing: border-box;
  z-index: 10;
}

.ctrl-btn {
  background: rgba(0, 0, 0, 0.4);
  border: 3px solid rgba(255,255,255,0.7);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  font-size: 2rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;
}
.ctrl-btn:active {
  background: rgba(0, 0, 0, 0.8);
}

/* Modales */
.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.pausa-container {
  color: white;
  text-align: center;
  animation: popIn 0.3s ease-out;
}
.pausa-container h1 {
  font-size: 5rem;
  margin: 0;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
  letter-spacing: 5px;
}

.pregunta-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  text-align: center;
  animation: popIn 0.3s ease-out;
}

@keyframes popIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.pregunta-container h2 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 1.4rem;
}

.opciones {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 1.5rem;
}

.btn-opcion {
  padding: 14px;
  font-size: 1.1rem;
  cursor: pointer;
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: #333;
}
.btn-opcion:hover {
  background-color: #e2e6ea;
}

/* Responsividad (Controles Móviles) */
@media (max-width: 768px) {
  .mobile-controls {
    display: flex;
  }
  .moto-wrapper {
    bottom: 150px; /* Elevar para que los botones no la tapen */
  }
  .stat-box {
    font-size: 1rem;
    padding: 8px 12px;
  }
}
</style>
