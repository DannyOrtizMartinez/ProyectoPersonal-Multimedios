<script setup>
const emit = defineEmits(['cambiar-pantalla'])
</script>

<template>
  <div class="screen">
    <h1>Pantalla de Inicio</h1>
    <p>¡Bienvenido al minijuego!</p>
    <button @click="emit('cambiar-pantalla', 'game')">Jugar</button>
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
  color: #2c3e50;
}
p {
  color: #555;
  font-size: 1.1rem;
}
button {
  padding: 12px 24px;
  font-size: 1.1rem;
  cursor: pointer;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  transition: transform 0.2s, background-color 0.2s;
  width: 100%;
  margin-top: 1rem;
}
button:hover {
  background-color: #45a049;
  transform: scale(1.02);
}
</style>
