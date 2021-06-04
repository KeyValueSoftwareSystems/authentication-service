import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: any): Promise<T | undefined> {
    return await this.cache.get<T>(key);
  }

  async set(key: any, value: any) {
    await this.cache.set(key, value);
  }

  async reset() {
    await this.cache.reset();
  }

  async del(key: any) {
    await this.cache.del(key);
  }
}
