<script setup>
const emit = defineEmits(['cambiar-pantalla'])
</script>

<template>
  <div class="screen">
    <h1>Pantalla de Juego</h1>
    <p>El juego está en progreso...</p>
    <button @click="emit('cambiar-pantalla', 'result')">Terminar</button>
  </div>
</template>

<style scoped>
.screen {
  padding: 20px;
  border: 1px solid #4caf50;
  border-radius: 8px;
}
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
