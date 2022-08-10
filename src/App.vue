<script setup>
import { ref } from "vue";
import axios from "axios";

const collecting = ref(false);
const groundTruth = ref("");
const errMsg = ref();
const showLoadingWheel = ref(false);

const url = import.meta.env.VITE_API_URL;
async function startCollecting() {
  console.log("Starting data collection");
  console.log(groundTruth.value);
  showLoadingWheel.value = true;
  try {
    await axios.get(
      `${url}/record-data?gt=${groundTruth.value}`
    );

    showLoadingWheel.value = false;
    collecting.value = true;
  } catch (error) {
    console.log(error);

    if (error.data?.e) errMsg.value = error.data?.e;
    else errMsg.value = error;
  }
}

async function stopCollecting() {
  console.log("Stopping data collection");
  showLoadingWheel.value = true;
  try {
    await axios.get(`${url}/stop-recording`);

    showLoadingWheel.value = false;
    collecting.value = false;
  } catch (error) {
    console.log(error);
    errMsg.value = error.data?.e;
  }
}
</script>

<template>
  <div class="collection-form">
    <div v-if="!collecting">
      <input v-model="groundTruth" placeholder="Ground truth" />
      <button v-if="!showLoadingWheel" @click="startCollecting">
        <p>Start collecting</p>
      </button>
      <div v-else class="lds-dual-ring"></div>
    </div>
    <div v-else>
      <h3>
        Collecting data for ground-truth: <br /><br /><span
          class="gt-label"
          >{{ groundTruth }}</span
        >
      </h3>
      <button v-if="!showLoadingWheel" @click="stopCollecting">
        <p>Stop collecting</p>
      </button>
      <div v-else class="lds-dual-ring"></div>
    </div>
    <p class="err" v-if="errMsg">{{ errMsg }}</p>
  </div>
</template>

<style scoped>
input {
  width: 80%;
  height: 40px;
  margin: auto;
  font-size: 25px;
}
button {
  margin: auto;
  margin-top: 40px;
  width: 200px;
}
.collection-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  margin-top: 200px;
}
.collection-form div {
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
}
.gt-label {
  font-weight: bold;
  font-size: 40px;
  text-decoration: underline;
}
.err {
  color: red;
}

.lds-dual-ring {
  display: inline-block;
  width: 80px;
  height: 80px;
  max-width: 80px;
  margin: auto;
  margin-top: 40px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 64px;
  min-height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid white;
  border-color: white transparent white transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
