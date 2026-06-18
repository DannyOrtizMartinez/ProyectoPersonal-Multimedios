<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['cambiar-pantalla'])

const mostrandoHistorial = ref(false)
const totalAciertos = ref(0)

onMounted(() => {
  const aciertosGuardados = localStorage.getItem('respuestasCorrectas')
  if (aciertosGuardados) {
    totalAciertos.value = parseInt(aciertosGuardados, 10)
  }
})
</script>

<template>
  <div class="screen">
    <h1>Wheelies Con conocimiento</h1>
    
    <div v-if="!mostrandoHistorial" class="menu-principal">
      <p>Demuestra tus habilidades de conducción y conocimiento.</p>
      <button class="btn-principal" @click="emit('cambiar-pantalla', 'game')">Jugar</button>
      <button class="btn-secundario" @click="mostrandoHistorial = true">Ver Historial</button>
    </div>

    <div v-else class="menu-historial">
      <h2>Historial de Jugador</h2>
      <div class="stat-circle">
        <span class="number">{{ totalAciertos }}</span>
        <span class="label">Aciertos Totales</span>
      </div>
      <button class="btn-volver" @click="mostrandoHistorial = false">Volver al Menú</button>
    </div>
  </div>
</template>

<style scoped>
.screen {
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 90%;
  max-width: 500px;
  box-sizing: border-box;
  text-align: center;
}

h1 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 2.2rem;
  margin-bottom: 1rem;
}

h2 {
  color: #2196f3;
  margin-top: 0;
}

p {
  color: #555;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

button {
  padding: 14px 24px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;
  width: 100%;
  margin-bottom: 1rem;
}

.btn-principal {
  background-color: #4caf50;
  color: white;
  box-shadow: 0 4px 0 #388e3c;
}
.btn-principal:hover {
  background-color: #45a049;
  transform: translateY(2px);
  box-shadow: 0 2px 0 #388e3c;
}

.btn-secundario, .btn-volver {
  background-color: #e0e0e0;
  color: #333;
  box-shadow: 0 4px 0 #bdbdbd;
}
.btn-secundario:hover, .btn-volver:hover {
  background-color: #d5d5d5;
  transform: translateY(2px);
  box-shadow: 0 2px 0 #bdbdbd;
}

.stat-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #f0f8ff;
  border: 4px solid #2196f3;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.stat-circle .number {
  font-size: 3rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-circle .label {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
}
</style>
