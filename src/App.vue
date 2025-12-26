<script setup lang="ts">
import NSFCalculator from './components/NSFCalculator.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
    <div class="w-full max-w-5xl">
       <div class="text-center mb-8">
          <h1 class="text-4xl font-black text-gray-800 tracking-tight">NSF Calculator</h1>
          <p class="text-gray-500 mt-2">วางแผนเกษียณกับกองทุนการออมแห่งชาติ (กอช.)</p>
       </div>
       <NSFCalculator />
       <footer class="mt-8 text-center text-xs text-gray-400">
          <p>ผลลัพธ์เป็นการประมาณการเบื้องต้น ตามข้อมูลจาก กอช. (2566)</p>
          <p>อัตราเงินสมทบรัฐบาล: 15-30 ปี (50%), 30-50 ปี (80%), 50-60 ปี (100%) สูงสุด 1,800 บาท/ปี</p>
          <a href="https://github.com/kamthorn/nsf-calculator" target="_blank">GitHub</a>
       </footer>
    </div>
  </div>
</template>
