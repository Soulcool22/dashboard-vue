/**
 * 空状态组件单元测试
 * 测试空数据显示
 * Requirements: 7.1, 7.2, 7.3
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '../../src/components/EmptyState.vue'

describe('EmptyState Component', () => {
  describe('Basic Rendering (Requirement 7.1, 7.3)', () => {
    it('renders with default props', () => {
      const wrapper = mount(EmptyState)
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-title').text()).toBe('暂无数据')
    })

    it('renders custom title', () => {
      const wrapper = mount(EmptyState, {
        props: { title: '暂无关注项目' }
      })
      expect(wrapper.find('.empty-title').text()).toBe('暂无关注项目')
    })

    it('renders description when provided', () => {
      const wrapper = mount(EmptyState, {
        props: { description: '点击搜索添加关注项目' }
      })
      expect(wrapper.find('.empty-description').text()).toBe('点击搜索添加关注项目')
    })

    it('does not render description when not provided', () => {
      const wrapper = mount(EmptyState)
      expect(wrapper.find('.empty-description').exists()).toBe(false)
    })
  })

  describe('Variant Styles (Requirement 7.2, 7.3)', () => {
    it('applies default variant class', () => {
      const wrapper = mount(EmptyState)
      expect(wrapper.find('.empty-state').classes()).toContain('default')
    })

    it('applies chart variant class', () => {
      const wrapper = mount(EmptyState, {
        props: { variant: 'chart' }
      })
      expect(wrapper.find('.empty-state').classes()).toContain('chart')
    })

    it('applies list variant class', () => {
      const wrapper = mount(EmptyState, {
        props: { variant: 'list' }
      })
      expect(wrapper.find('.empty-state').classes()).toContain('list')
    })

    it('applies compact class when compact prop is true', () => {
      const wrapper = mount(EmptyState, {
        props: { compact: true }
      })
      expect(wrapper.find('.empty-state').classes()).toContain('compact')
    })
  })

  describe('Icon Types', () => {
    it('applies data icon class by default', () => {
      const wrapper = mount(EmptyState)
      expect(wrapper.find('.empty-icon').classes()).toContain('icon-data')
    })

    it('applies chart icon class', () => {
      const wrapper = mount(EmptyState, {
        props: { icon: 'chart' }
      })
      expect(wrapper.find('.empty-icon').classes()).toContain('icon-chart')
    })

    it('applies people icon class', () => {
      const wrapper = mount(EmptyState, {
        props: { icon: 'people' }
      })
      expect(wrapper.find('.empty-icon').classes()).toContain('icon-people')
    })

    it('applies folder icon class', () => {
      const wrapper = mount(EmptyState, {
        props: { icon: 'folder' }
      })
      expect(wrapper.find('.empty-icon').classes()).toContain('icon-folder')
    })
  })

  describe('Slot Support', () => {
    it('renders action slot content', () => {
      const wrapper = mount(EmptyState, {
        slots: {
          action: '<button class="retry-btn">重试</button>'
        }
      })
      expect(wrapper.find('.retry-btn').exists()).toBe(true)
    })

    it('renders custom icon slot content', () => {
      const wrapper = mount(EmptyState, {
        slots: {
          icon: '<span class="custom-icon">🔍</span>'
        }
      })
      expect(wrapper.find('.custom-icon').exists()).toBe(true)
    })
  })
})
