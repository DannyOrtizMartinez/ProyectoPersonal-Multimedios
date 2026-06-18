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
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
