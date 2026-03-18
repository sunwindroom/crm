/**
 * 缓存工具类
 * 支持内存缓存和localStorage缓存
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  expireTime: number
}

class CacheManager {
  private memoryCache: Map<string, CacheItem<any>> = new Map()
  private readonly DEFAULT_EXPIRE_TIME = 5 * 60 * 1000 // 默认5分钟过期

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param expireTime 过期时间(毫秒),默认5分钟
   * @param persist 是否持久化到localStorage,默认false
   */
  set<T>(key: string, data: T, expireTime: number = this.DEFAULT_EXPIRE_TIME, persist: boolean = false): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expireTime
    }

    // 设置内存缓存
    this.memoryCache.set(key, cacheItem)

    // 如果需要持久化,同时设置localStorage
    if (persist) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem))
      } catch (error) {
        console.error('Failed to persist cache to localStorage:', error)
      }
    }
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @param fromPersist 是否从localStorage读取,默认false
   * @returns 缓存数据,如果不存在或已过期则返回null
   */
  get<T>(key: string, fromPersist: boolean = false): T | null {
    // 先从内存缓存获取
    let cacheItem = this.memoryCache.get(key)

    // 如果内存缓存不存在且需要从localStorage读取
    if (!cacheItem && fromPersist) {
      try {
        const persistedData = localStorage.getItem(`cache_${key}`)
        if (persistedData) {
          cacheItem = JSON.parse(persistedData)
          // 重新设置到内存缓存
          if (cacheItem) {
            this.memoryCache.set(key, cacheItem)
          }
        }
      } catch (error) {
        console.error('Failed to read cache from localStorage:', error)
      }
    }

    // 检查缓存是否存在
    if (!cacheItem) {
      return null
    }

    // 检查是否过期
    if (Date.now() - cacheItem.timestamp > cacheItem.expireTime) {
      this.delete(key)
      return null
    }

    return cacheItem.data as T
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    this.memoryCache.delete(key)
    try {
      localStorage.removeItem(`cache_${key}`)
    } catch (error) {
      console.error('Failed to delete cache from localStorage:', error)
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.memoryCache.clear()
    try {
      // 清空所有以cache_开头的localStorage项
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Failed to clear cache from localStorage:', error)
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()

    // 清理内存缓存
    this.memoryCache.forEach((item, key) => {
      if (now - item.timestamp > item.expireTime) {
        this.memoryCache.delete(key)
      }
    })

    // 清理localStorage缓存
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          const data = localStorage.getItem(key)
          if (data) {
            const item = JSON.parse(data)
            if (now - item.timestamp > item.expireTime) {
              localStorage.removeItem(key)
            }
          }
        }
      })
    } catch (error) {
      console.error('Failed to cleanup localStorage cache:', error)
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    let memoryCount = this.memoryCache.size
    let persistCount = 0

    try {
      const keys = Object.keys(localStorage)
      persistCount = keys.filter(key => key.startsWith('cache_')).length
    } catch (error) {
      console.error('Failed to get cache stats:', error)
    }

    return {
      memoryCount,
      persistCount,
      totalCount: memoryCount + persistCount
    }
  }
}

// 导出单例实例
export const cacheManager = new CacheManager()

// 定期清理过期缓存(每10分钟)
setInterval(() => {
  cacheManager.cleanup()
}, 10 * 60 * 1000)

// 导出类型
export type { CacheItem }
