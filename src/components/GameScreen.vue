<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['cambiar-pantalla'])

const listaPreguntas = ref([])
const indicePregunta = ref(0)

const audioAcierto = ref(null)
const audioError = ref(null)
const audioGameOver = ref(null)

const cargarPreguntas = async () => {
  try {
    const respuesta = await fetch('/preguntas.json')
    const datos = await respuesta.json()
    listaPreguntas.value = datos
  } catch (error) {
    console.error('Error al cargar las preguntas:', error)
  }
}

const anguloRotacion = ref(0)

const revisarDerrota = () => {
  if (anguloRotacion.value <= -60 || anguloRotacion.value >= 60) {
    if (audioGameOver.value) {
      audioGameOver.value.currentTime = 0
      audioGameOver.value.play()
    }
    emit('cambiar-pantalla', 'result')
  }
}

const manejarTeclado = (event) => {
  if (event.key === 'ArrowLeft') {
    anguloRotacion.value -= 5
  } else if (event.key === 'ArrowRight') {
    anguloRotacion.value += 5
  }
  revisarDerrota()
}

const verificarRespuesta = (opcionSeleccionada) => {
  const preguntaActual = listaPreguntas.value[indicePregunta.value]
  
  if (opcionSeleccionada === preguntaActual.respuesta_correcta) {
    if (audioAcierto.value) {
      audioAcierto.value.currentTime = 0
      audioAcierto.value.play()
    }
    anguloRotacion.value = 0 // Estabilizar
    
    if (indicePregunta.value < listaPreguntas.value.length - 1) {
      indicePregunta.value++
    } else {
      emit('cambiar-pantalla', 'result') // Se acabaron las preguntas
    }
  } else {
    if (audioError.value) {
      audioError.value.currentTime = 0
      audioError.value.play()
    }
    const desestabilizacion = Math.random() > 0.5 ? 35 : -35
    anguloRotacion.value += desestabilizacion
    revisarDerrota()
  }
}

onMounted(() => {
  cargarPreguntas()
  window.addEventListener('keydown', manejarTeclado)
})

onUnmounted(() => {
  window.removeEventListener('keydown', manejarTeclado)
})
</script>

<template>
  <div class="screen">
    <h1>Pantalla de Juego</h1>
    
    <div v-if="listaPreguntas.length > 0" class="pregunta-container">
      <h2>{{ listaPreguntas[indicePregunta].pregunta }}</h2>
      <div class="opciones">
        <button 
          v-for="(opcion, index) in listaPreguntas[indicePregunta].opciones" 
          :key="index"
          class="btn-opcion"
          @click="verificarRespuesta(opcion)"
        >
          {{ opcion }}
        </button>
      </div>
    </div>
    <div v-else>
      <p>Cargando preguntas...</p>
    </div>

    <div class="moto-container" :style="{ transform: `rotate(${anguloRotacion}deg)` }">
      🏍️
    </div>

    <button class="btn-terminar" @click="emit('cambiar-pantalla', 'result')">Terminar</button>

    <!-- Audios ocultos -->
    <audio ref="audioAcierto" src="/acierto.mp3"></audio>
    <audio ref="audioError" src="/error.mp3"></audio>
    <audio ref="audioGameOver" src="/game_over.mp3"></audio>
  </div>
</template>

<style scoped>
.screen {
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
h1 { margin-top: 0; color: #2c3e50; }
.pregunta-container {
  margin: 1rem 0;
  padding: 1.5rem;
  background-color: #694848;
  border-radius: 8px;
  color: #f3efef;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}
h2 {
  font-size: 1.2rem;
  margin-top: 0;
}
.opciones {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 1rem;
}
.btn-opcion {
  padding: 12px;
  font-size: 1rem;
  cursor: pointer;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #000000;
  text-align: left;
}
.btn-opcion:hover {
  background-color: #dee2e6;
  transform: translateX(4px);
}
.btn-terminar {
  margin-top: 2rem;
  padding: 12px 24px;
  font-size: 1rem;
  cursor: pointer;
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 6px;
  width: 100%;
  transition: background-color 0.2s;
}
.btn-terminar:hover {
  background-color: #ff1744;
}
.moto-container {
  margin: 2rem auto;
  font-size: 80px;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s linear;
}
@media (max-width: 480px) {
  .screen { padding: 1.5rem; }
  h2 { font-size: 1.1rem; }
  .btn-opcion { font-size: 0.95rem; }
  .moto-container { font-size: 60px; height: 80px; margin: 1rem auto; }
}
</style>
