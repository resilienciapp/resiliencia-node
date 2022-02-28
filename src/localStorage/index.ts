import _Redis, { KeyType, Redis, ValueType } from 'ioredis'

let LocalStorage: Redis

export enum CacheKeyPrefix {
  MARKER_REPORTS_AMOUNT = 'MARKER_REPORTS_AMOUNT:',
  USER_REPORT = 'USER_REPORT:',
}

const computeCacheKey = (
  keyPrefix: CacheKeyPrefix,
  key: KeyType | number,
): string => keyPrefix + key.toString()

export const getRedisInstance = () => new _Redis(process.env.REDIS_URL)

export const installLocalStorage = () => {
  LocalStorage = new _Redis(process.env.REDIS_URL)
}

export const delKey = (key: string) => LocalStorage.del(key)

export const del = (keyPrefix: CacheKeyPrefix, key: KeyType | number) =>
  LocalStorage.del(computeCacheKey(keyPrefix, key))

export const exists = (keyPrefix: CacheKeyPrefix, key: KeyType | number) =>
  LocalStorage.exists(computeCacheKey(keyPrefix, key))

export const get = (keyPrefix: CacheKeyPrefix, key: KeyType | number) =>
  LocalStorage.get(computeCacheKey(keyPrefix, key))

export const keys = (pattern: string) => LocalStorage.keys(pattern)

export const set = (
  keyPrefix: CacheKeyPrefix,
  key: KeyType | number,
  value: ValueType,
  seconds?: number,
) =>
  seconds
    ? LocalStorage.set(computeCacheKey(keyPrefix, key), value, 'EX', seconds)
    : LocalStorage.set(computeCacheKey(keyPrefix, key), value)
