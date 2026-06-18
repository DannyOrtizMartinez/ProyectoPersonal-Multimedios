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
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
}
h1 {
  margin-top: 0;
  color: #2196f3;
}
p {
  color: #555;
  font-size: 1.1rem;
}
button {
  padding: 12px 24px;
  font-size: 1.1rem;
  cursor: pointer;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  transition: transform 0.2s, background-color 0.2s;
  width: 100%;
  margin-top: 1rem;
}
button:hover {
  background-color: #1976d2;
  transform: scale(1.02);
}
</style>
