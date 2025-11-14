<template>
  <span class="info-icon" @mouseenter="show" @mouseleave="hide">?</span>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ tip: { type: String, default: '' } })
let bubble = null
function show(){ const tip = props.tip; if(!tip) return; hide(); bubble = document.createElement('div'); bubble.className='tooltip-bubble'; bubble.textContent = tip; document.body.appendChild(bubble); const rect = document.querySelector('.info-icon')?.getBoundingClientRect(); const bRect = bubble.getBoundingClientRect(); if(rect){ const top = rect.top + rect.height/2 - bRect.height/2; const left = rect.right + 8; bubble.style.top = top + 'px'; bubble.style.left = left + 'px'; } }
function hide(){ if(bubble && bubble.parentNode){ bubble.parentNode.removeChild(bubble); bubble = null } }
</script>

<style scoped>
.info-icon { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; line-height: 14px; border-radius: 50%; border: 1px solid var(--accent); color: var(--accent); font-size: 10px; font-weight: 700; margin-left: 6px; background: #ffffff; cursor: help; position: relative; }
</style>