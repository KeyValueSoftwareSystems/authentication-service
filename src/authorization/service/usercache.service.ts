import User from '../entity/user.entity';
import { RedisCacheService } from 'src/cache/redis-cache/redis-cache.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class UserCacheService {
  constructor(private cacheManager: RedisCacheService) {}

  async getUserById(id: string): Promise<User | undefined> {
    return await this.cacheManager.get('USER:' + id);
  }

  async setUseryById(id: string, value: User): Promise<User> {
    await this.cacheManager.set('USER:' + id, value);
    return value;
  }
}
