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

// Estados del juego (Endless Runner)
const anguloRotacion = ref(0)
const juegoPausado = ref(false)
const mostrandoPregunta = ref(false)

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

// Bucle principal del juego (Game Loop)
const gameLoop = (timestamp) => {
  if (!lastTime) lastTime = timestamp
  const deltaTime = timestamp - lastTime
  lastTime = timestamp

  if (!juegoPausado.value) {
    // 1. Aumentar distancia
    distancia.value += 5 * (deltaTime / 16)
    tiempoAcumuladoPregunta += deltaTime

    // 2. Físicas y Gravedad
    if (isAccelerating) {
      anguloRotacion.value += 1.5 * (deltaTime / 16) // Hace wheelie
    } else if (isBraking) {
      anguloRotacion.value -= 1.5 * (deltaTime / 16) // Se inclina hacia adelante
    } else {
      // Gravedad: Volver a 0 lentamente si no presiona nada
      if (anguloRotacion.value > 0) {
        anguloRotacion.value = Math.max(0, anguloRotacion.value - 1.0 * (deltaTime / 16))
      } else if (anguloRotacion.value < 0) {
        anguloRotacion.value = Math.min(0, anguloRotacion.value + 1.0 * (deltaTime / 16))
      }
    }

    // 3. Revisar condición de derrota (Game Over)
    if (anguloRotacion.value > 60 || anguloRotacion.value < -20) {
      terminarJuego()
      return // Detener el loop de este frame
    }

    // 4. Aparición de preguntas (ej. cada 5 segundos)
    if (tiempoAcumuladoPregunta >= 5000 && indicePregunta.value < listaPreguntas.value.length) {
      mostrarPregunta()
    }
  }

  // Siguiente frame
  gameLoopId = requestAnimationFrame(gameLoop)
}

const mostrarPregunta = () => {
  juegoPausado.value = true
  mostrandoPregunta.value = true
  tiempoAcumuladoPregunta = 0
  
  // Reiniciar estado de teclas para evitar aceleración accidental post-pausa
  isAccelerating = false
  isBraking = false
}

const verificarRespuesta = (opcionSeleccionada) => {
  const preguntaActual = listaPreguntas.value[indicePregunta.value]
  
  if (opcionSeleccionada === preguntaActual.respuesta_correcta) {
    // Acierto
    if (audioAcierto.value) {
      audioAcierto.value.currentTime = 0
      audioAcierto.value.play()
    }
    puntos.value += 100
  } else {
    // Error
    if (audioError.value) {
      audioError.value.currentTime = 0
      audioError.value.play()
    }
    // Desestabilizar la moto (Suma bruscamente 35 grados)
    anguloRotacion.value += 35
  }
  
  // Ocultar modal y reanudar
  mostrandoPregunta.value = false
  juegoPausado.value = false
  lastTime = performance.now() // Evitar salto de tiempo en deltaTime tras la pausa
  
  // Pasar a la siguiente pregunta
  if (indicePregunta.value < listaPreguntas.value.length) {
    indicePregunta.value++
  }

  // Revisar derrota inmediatamente por si la desestabilización lo hizo caer
  if (anguloRotacion.value > 60 || anguloRotacion.value < -20) {
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

// Ciclos de vida
onMounted(() => {
  cargarPreguntas()
  window.addEventListener('keydown', manejarTeclaDown)
  window.addEventListener('keyup', manejarTeclaUp)
  
  // Iniciar el Game Loop
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
  <div class="screen endless-runner" :class="{ pausado: juegoPausado }">
    <!-- UI Superior (Puntos y Distancia) -->
    <div class="stats">
      <div class="stat-box">Distancia: {{ Math.floor(distancia) }}m</div>
      <div class="stat-box">Puntos: {{ puntos }}</div>
    </div>
    
    <!-- Área de juego -->
    <div class="game-area">
      <!-- Fondo y carretera animada -->
      <div class="sky"></div>
      <div class="road-container">
        <div class="road"></div>
      </div>
      
      <!-- Moto -->
      <div class="moto-wrapper">
        <div class="moto-container" :style="{ transform: `rotate(${anguloRotacion}deg)` }">
          <img src="/moto.png" alt="Moto" class="moto-img" />
        </div>
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

    <!-- Audios ocultos -->
    <audio ref="audioAcierto" src="/acierto.mp3"></audio>
    <audio ref="audioError" src="/error.mp3"></audio>
    <audio ref="audioGameOver" src="/game_over.mp3"></audio>
  </div>
</template>

<style scoped>
/* Contenedor principal de la pantalla */
.screen.endless-runner {
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 500px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
}

/* Estadísticas Superiores */
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
  letter-spacing: 1px;
}

/* Escenario del Juego */
.game-area {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.sky {
  flex: 1;
  background: linear-gradient(to bottom, #87CEEB, #E0F6FF);
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
  /* Líneas de la carretera */
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
  animation: moveRoad 0.8s linear infinite;
}

/* Pausar animaciones cuando el juego está pausado */
.screen.pausado .road {
  animation-play-state: paused;
}

@keyframes moveRoad {
  from { transform: translateX(0); }
  to { transform: translateX(-100px); }
}

/* Vehículo */
.moto-wrapper {
  position: absolute;
  bottom: 60px; /* Posicionado justo sobre la carretera */
  left: 20%;
}

.moto-container {
  width: 140px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: bottom center; /* Rota desde la rueda trasera/centro inferior */
  /* NO poner transition: transform aquí para que requestAnimationFrame fluya sin jitter */
}

.moto-img {
  width: 100%;
  height: auto;
  /* Efecto placeholder por si no hay imagen aún */
  min-height: 80px; 
  background-color: transparent;
}

/* Modal de Pregunta */
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
  font-weight: 500;
}

.btn-opcion:hover {
  background-color: #e2e6ea;
  border-color: #dae0e5;
  transform: translateY(-2px);
}

/* Responsividad */
@media (max-width: 600px) {
  .screen.endless-runner { height: 100vh; max-height: none; border-radius: 0; }
  .moto-wrapper { bottom: 80px; left: 10%; }
  .moto-container { width: 100px; }
  .stat-box { font-size: 1rem; padding: 8px 15px; }
  .pregunta-container { padding: 1.5rem; }
  .pregunta-container h2 { font-size: 1.2rem; }
  .btn-opcion { padding: 12px; font-size: 1rem; }
}
</style>
