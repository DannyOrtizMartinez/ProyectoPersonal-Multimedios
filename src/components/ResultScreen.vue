<script setup>
const emit = defineEmits(['cambiar-pantalla'])
</script>

<template>
  <div class="screen">
    <h1>Pantalla de Resultados</h1>
    <p>¡Juego terminado! Aquí están tus resultados.</p>
    <button @click="emit('cambiar-pantalla', 'start')">Volver al Inicio</button>
  </div>
</template>

<style scoped>
.screen {
  padding: 20px;
  border: 1px solid #2196f3;
  border-radius: 8px;
}
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
