<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['cambiar-pantalla'])

const listaPreguntas = ref([])

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

const manejarTeclado = (event) => {
  if (event.key === 'ArrowLeft') {
    anguloRotacion.value -= 5
  } else if (event.key === 'ArrowRight') {
    anguloRotacion.value += 5
  }

  if (anguloRotacion.value <= -60 || anguloRotacion.value >= 60) {
    emit('cambiar-pantalla', 'result')
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
      <h2>{{ listaPreguntas[0].pregunta }}</h2>
      <div class="opciones">
        <button 
          v-for="(opcion, index) in listaPreguntas[0].opciones" 
          :key="index"
          class="btn-opcion"
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
  </div>
</template>

<style scoped>
.screen {
  padding: 20px;
  border: 1px solid #4caf50;
  border-radius: 8px;
}
.pregunta-container {
  margin: 20px 0;
  padding: 15px;
  background-color: #694848ff;
  border-radius: 8px;
  color: #f3efefff;
}
.opciones {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}
.btn-opcion {
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  background-color: #e0e0e0;
  border: none;
  border-radius: 4px;
  transition: background-color 0.2s;
  color: #000000ff;
}
.btn-opcion:hover {
  background-color: #d0d0d0;
}
.btn-terminar {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 4px;
}
.moto-container {
  margin: 40px auto;
  font-size: 80px;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s linear;
}
</style>
