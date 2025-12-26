<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useNSFCalculation, type CalculationResult } from '../composables/useNSFCalculation';

const { calculateResult } = useNSFCalculation();

// Load settings
const saved = localStorage.getItem('kpf_settings');
let defaultAge = 15;
let defaultSavings = 100;
let defaultRate = 2.5;

if (saved) {
  try {
    const parsed = JSON.parse(saved);
    if (parsed.age) defaultAge = parsed.age;
    if (parsed.savings) defaultSavings = parsed.savings;
    if (parsed.interestRate) defaultRate = parsed.interestRate;
  } catch (e) {
    console.error('Failed to parse settings', e);
  }
}

// Inputs
const age = ref(defaultAge);
const savings = ref(defaultSavings);
const interestRate = ref(defaultRate);

// Validation
const minAge = 15;
const maxAge = 60;

// Actually NSF max is 13,200 per YEAR. So 1,100 per month?
// Wait, the spreadsheet says "13,200". If input is "Monthly", max is 1,100.
// Spreadsheet input "Monthly Savings" cell B5.
// Let's assume user might want to save more but capped? 
// The law says max 13,200 per year.
// So max monthly = 1,100.
// Let's set max slider to 1100.

const savingsLimit = 2500; // Updated limit (30,000/year equivalent)

// Result State
const result = ref<CalculationResult | null>(null);

const calculate = () => {
  result.value = calculateResult(age.value, savings.value, interestRate.value);
};

// Auto-calculate on changes
watch([age, savings, interestRate], () => {
  // Clamp values
  if (age.value < minAge) age.value = minAge;
  if (age.value >= maxAge) age.value = maxAge - 1;
  // if (savings.value > savingsLimit) savings.value = savingsLimit; 
  // Allow user to type more? No, strictly enforce rule? 
  // Let's just calculate.
  // Save to localStorage
  localStorage.setItem('kpf_settings', JSON.stringify({
    age: age.value,
    savings: savings.value,
    interestRate: interestRate.value
  }));
  
  calculate();
}, { immediate: true });



// Formatter
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
};

const formatNumber = (val: number) => {
  return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(val);
}
</script>

<template>
  <div class="card bg-base-100 shadow-xl max-w-4xl mx-auto w-full">
    <div class="card-body">
      <h2 class="card-title text-2xl font-bold text-primary mb-6">คำนวณเงินบำนาญ กอช.</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Input Section -->
        <div class="space-y-6">
          <!-- Age Input -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">อายุของคุณ (ปี)</span>
              <span class="label-text-alt text-primary font-bold">{{ age }} ปี</span>
            </label>
            <input 
              type="range" 
              min="15" 
              :max="59" 
              v-model.number="age" 
              class="range range-primary range-sm" 
            />
            <div class="w-full flex justify-between text-xs px-2 mt-1 opacity-50">
              <span>15</span>
              <span>30</span>
              <span>45</span>
              <span>60</span>
            </div>
          </div>

          <!-- Savings Input -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">เงินออมต่อเดือน (บาท)</span>
              <span class="label-text-alt text-primary font-bold">{{ formatNumber(savings) }} บาท</span>
            </label>
            <input 
              type="range" 
              min="50" 
              :max="savingsLimit" 
              step="50"
              v-model.number="savings" 
              class="range range-secondary range-sm" 
            />
             <div class="w-full flex justify-between text-xs px-2 mt-1 opacity-50">
              <span>50</span>
              <span>{{ savingsLimit/2 }}</span>
              <span>{{ savingsLimit }}</span>
            </div>
            <label class="input-group mt-2">
              <input 
                type="number" 
                v-model.number="savings" 
                class="input input-bordered input-sm w-full" 
                :max="savingsLimit"
              />
            </label>
            <div class="text-xs text-error mt-1" v-if="savings > savingsLimit">
              * สูงสุดไม่เกิน {{ savingsLimit }} บาท/เดือน ({{ savingsLimit * 12 }} บาท/ปี)
            </div>
          </div>

          <!-- Interest Rate Input -->
          <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
            <input type="checkbox" /> 
            <div class="collapse-title text-sm font-medium">
              ตัวเลือกเพิ่มเติม (อัตราผลตอบแทน)
            </div>
            <div class="collapse-content"> 
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">อัตราผลตอบแทนคาดการณ์ (% ต่อปี)</span>
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  v-model.number="interestRate" 
                  class="input input-bordered w-full" 
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Result Section -->
        <div v-if="result" class="bg-base-200 rounded-xl p-6 flex flex-col justify-center space-y-4">
          
          <div class="text-center">
            <div class="text-sm opacity-70 mb-1">เงินบำนาญที่คาดว่าจะได้รับ</div>
            <div class="text-3xl sm:text-4xl font-extrabold text-primary break-words px-4">
              {{ formatCurrency(result.monthlyPension) }}
              <span class="text-lg font-normal text-base-content opacity-70 block sm:inline">/ เดือน</span>
            </div>
            <div class="text-xs mt-2 badge badge-outline" v-if="result.monthlyPension < 600">
              * กอช. การันตีขั้นต่ำ 600 บาท/เดือน จนกว่าเงินจะหมด
            </div>
            <div class="text-xs mt-2 badge badge-success gap-2" v-else>
              ตลอดชีพ
            </div>
          </div>

          <div class="divider">ยอดเงินรวม ณ อายุ 60 ปี</div>

          <div class="stats stats-vertical lg:stats-horizontal shadow bg-base-100 w-full overflow-hidden">
            <div class="stat place-items-center p-2 sm:p-4">
              <div class="stat-title text-xs sm:text-sm">เงินออมสะสม</div>
              <div class="stat-value text-base sm:text-lg text-secondary whitespace-normal text-center break-words">{{ formatNumber(result.totalMemberSavings) }}</div>
            </div>
            
            <div class="stat place-items-center p-2 sm:p-4">
              <div class="stat-title text-xs sm:text-sm">รัฐสมทบ</div>
              <div class="stat-value text-base sm:text-lg text-accent whitespace-normal text-center break-words">{{ formatNumber(result.totalGovtContribution) }}</div>
            </div>
            
            <div class="stat place-items-center p-2 sm:p-4">
              <div class="stat-title text-xs sm:text-sm">ผลประโยชน์</div>
              <div class="stat-value text-base sm:text-lg text-warning whitespace-normal text-center break-words">{{ formatNumber(result.totalInterest) }}</div>
            </div>
          </div>

          <div class="text-center mt-4">
            <div class="text-sm opacity-70">ยอดเงินรวมทั้งหมด</div>
            <div class="text-2xl font-bold">{{ formatCurrency(result.totalBalanceAt60) }}</div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
