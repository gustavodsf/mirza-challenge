import { Injectable } from '@nestjs/common';
import { fetchJsonWithRetry } from 'src/utils';
import { ExternalProfile, ExternalUser } from './types';

@Injectable()
export class ProfileService {
  private readonly usersBaseUrl =
    'https://62d85cba9c8b5185c787f36b.mockapi.io/api/v1/users';

  // Increase delay if 429 continues (try 500-1000ms)
  private readonly perRequestDelayMs = 500;

  async getPrimaryProfile(userId: string): Promise<ExternalProfile> {
    const profiles = await fetchJsonWithRetry<ExternalProfile[]>(
      `${this.usersBaseUrl}/${userId}/profiles`,
    );
    return profiles[0] ?? ({} as ExternalProfile);
  }

  async getPrimaryProfilesOneByOne(
    users: ExternalUser[],
  ): Promise<Map<string, ExternalProfile>> {
    const result = new Map<string, ExternalProfile>();

    for (const user of users) {
      const profile = await this.getPrimaryProfile(user.id);
      result.set(user.id, profile);

      // throttle requests to avoid API rate limit
      await this.sleep(this.perRequestDelayMs);
    }

    return result;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}