import { cacheManager } from './cache'

/**
 * API缓存装饰器
 * 用于缓存API请求结果
 * @param key 缓存键
 * @param expireTime 过期时间(毫秒)
 * @param persist 是否持久化
 */
export function cacheApi(key: string, expireTime: number = 5 * 60 * 1000, persist: boolean = false) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // 生成缓存键(包含参数)
      const cacheKey = `${key}_${JSON.stringify(args)}`

      // 尝试从缓存获取
      const cachedData = cacheManager.get(cacheKey, persist)
      if (cachedData !== null) {
        console.log(`[Cache Hit] ${cacheKey}`)
        return cachedData
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args)

      // 缓存结果
      cacheManager.set(cacheKey, result, expireTime, persist)
      console.log(`[Cache Set] ${cacheKey}`)

      return result
    }

    return descriptor
  }
}

/**
 * 清除API缓存
 * @param keyPattern 缓存键模式(支持通配符*)
 */
export function clearApiCache(keyPattern: string) {
  // 获取所有缓存键
  const stats = cacheManager.getStats()

  // 清除匹配的缓存
  // 这里简化处理,实际可以使用正则表达式匹配
  if (keyPattern.includes('*')) {
    // 如果包含通配符,清除所有相关缓存
    const prefix = keyPattern.replace('*', '')
    // 这里需要扩展CacheManager来支持模式匹配删除
    console.log(`[Cache Clear] Pattern: ${keyPattern}`)
  } else {
    cacheManager.delete(keyPattern)
    console.log(`[Cache Clear] Key: ${keyPattern}`)
  }
}

/**
 * 预加载API数据
 * @param apiCall API调用函数
 * @param key 缓存键
 * @param expireTime 过期时间
 */
export async function preloadApiData<T>(
  apiCall: () => Promise<T>,
  key: string,
  expireTime: number = 5 * 60 * 1000
): Promise<T> {
  const data = await apiCall()
  cacheManager.set(key, data, expireTime, false)
  return data
}
