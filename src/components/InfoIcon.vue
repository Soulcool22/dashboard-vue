<template>
  <span class="info-icon" ref="elRef" @mouseenter="show" @mouseleave="hide">?</span>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ tip: { type: String, default: '' } })
const elRef = ref(null)
let bubble = null
function show(){
  const tip = props.tip
  if(!tip) return
  hide()
  bubble = document.createElement('div')
  bubble.className='tooltip-bubble'
  bubble.textContent = tip
  document.body.appendChild(bubble)
  const el = elRef.value
  if(!el) return
  const rect = el.getBoundingClientRect()
  const bRect = bubble.getBoundingClientRect()
  let top = rect.top + rect.height/2 - bRect.height/2
  let left = rect.right + 8
  const margin = 8
  const vw = window.innerWidth
  const vh = window.innerHeight
  if(top < margin){ top = rect.bottom + margin; left = rect.left }
  if(top + bRect.height > vh - margin){ top = rect.top - bRect.height - margin }
  if(left + bRect.width > vw - margin){ left = rect.left - bRect.width - margin }
  if(left < margin){ left = margin }
  bubble.style.top = top + 'px'
  bubble.style.left = left + 'px'
}
function hide(){ if(bubble && bubble.parentNode){ bubble.parentNode.removeChild(bubble); bubble = null } }
</script>

<style scoped>
.info-icon { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; line-height: 14px; border-radius: 50%; border: 1px solid var(--accent); color: var(--accent); font-size: 10px; font-weight: 700; background: #ffffff; cursor: help; position: relative; }
</style>