import { ref, onMounted, onBeforeUnmount } from 'vue'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function useResponsive() {
  const deviceType = ref<DeviceType>('desktop')
  const screenWidth = ref(window.innerWidth)
  const screenHeight = ref(window.innerHeight)

  const updateDeviceType = () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight

    if (window.innerWidth < 768) {
      deviceType.value = 'mobile'
    } else if (window.innerWidth < 1024) {
      deviceType.value = 'tablet'
    } else {
      deviceType.value = 'desktop'
    }
  }

  const isMobile = () => deviceType.value === 'mobile'
  const isTablet = () => deviceType.value === 'tablet'
  const isDesktop = () => deviceType.value === 'desktop'

  onMounted(() => {
    updateDeviceType()
    window.addEventListener('resize', updateDeviceType)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateDeviceType)
  })

  return {
    deviceType,
    screenWidth,
    screenHeight,
    isMobile,
    isTablet,
    isDesktop
  }
}

/**
 * 防抖函数
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

/**
 * 节流函数
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastCall >= delay) {
      fn.apply(this, args)
      lastCall = now
    }
  }
}

/**
 * 本地存储Hook
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const storedValue = localStorage.getItem(key)
  const value = ref<T>(storedValue ? JSON.parse(storedValue) : defaultValue)

  const setValue = (newValue: T) => {
    value.value = newValue as any
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  const removeValue = () => {
    value.value = defaultValue as any
    localStorage.removeItem(key)
  }

  return {
    value,
    setValue,
    removeValue
  }
}

/**
 * 加载状态Hook
 */
export function useLoading(initialState: boolean = false) {
  const loading = ref(initialState)

  const startLoading = () => {
    loading.value = true
  }

  const stopLoading = () => {
    loading.value = false
  }

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    startLoading()
    try {
      return await fn()
    } finally {
      stopLoading()
    }
  }

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading
  }
}
