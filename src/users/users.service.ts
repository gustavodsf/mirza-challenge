import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { SearchUsersDto } from './dto/search.user.dto';
import {ExternalProfile, ExternalUser, SearchResponse, UserSearchRow } from './types'
import { ProfileService } from './profile.service';
import { fetchJsonWithRetry } from 'src/utils';
import { SortOrder } from './types';


@Injectable()
export class UsersService {
    private readonly usersBaseUrl =
    'https://62d85cba9c8b5185c787f36b.mockapi.io/api/v1/users';
    private readonly cacheTtlMs = 60_000;

    private readonly profileBatchSize = 5;
    private readonly batchPauseMs = 250;

    constructor(private readonly profileService: ProfileService) {}

    //TODO: Implement a cache when we have multiple hits more than 3
    private cache:
    | {
        expiresAt: number;
        data: UserSearchRow[];
        }
    | null = null;

    async searchUsers(query: SearchUsersDto): Promise<SearchResponse> {
        const allRows = await this.getUsersWithProfilesCached();

        const filtered = allRows.filter((row) => {
            return (
                this.contains(row.id, query.id) &&
                this.contains(row.full_name, query.full_name) &&
                this.contains(row.username, query.username) &&
                this.contains(row.city, query.city) &&
                this.contains(row.state, query.state)
            );
        });

        const sortBy = query.sortBy as keyof UserSearchRow;
        const order: SortOrder = query.order ?? 'asc';
        const sorted = [...filtered].sort((a, b) => {
            const av = String(a[sortBy] ?? '').toLowerCase();
            const bv = String(b[sortBy] ?? '').toLowerCase();

            if (av < bv) return order === 'asc' ? -1 : 1;
            if (av > bv) return order === 'asc' ? 1 : -1;
            return 0;
        });

        const page = query.start_page ?? 1;
        const perPage = query.limit ?? 10;
        const total = sorted.length;
        const totalPages = Math.ceil(total / perPage);
        const start = (page - 1) * perPage;
        const data = sorted.slice(start, start + perPage);

        return {
            result: {
                page,
                per_page: perPage,
                total,
                total_pages: totalPages,
                data,
            },
            error: {},
        };

    }


    private async getUsersWithProfilesCached(): Promise<UserSearchRow[]> {
        const now = Date.now();
        if (this.cache && this.cache.expiresAt > now) {
        return this.cache.data;
        }

        const users = await fetchJsonWithRetry<ExternalUser[]>(
        `${this.usersBaseUrl}`,
        );

        const profilesByUserId = await this.profileService.getPrimaryProfilesOneByOne(users);

        const rows: UserSearchRow[] = users.map((user) => {
            const profile = profilesByUserId.get(user.id) ?? ({} as ExternalProfile);

            return {
            id: user.id ?? '',
            profileId: profile.id ?? '',
            full_name: profile.full_name ?? '',
            username: user.username ?? '',
            gender: profile.gender ?? '',
            address: profile.address ?? '',
            city: profile.city ?? '',
            state: profile.state ?? '',
            country: profile.country ?? '',
            updated_at: profile.updatedAt ?? '',
            created_at: profile.createdAt ?? user.createdAt ?? '',
            };
        });

        this.cache = {
        expiresAt: now + this.cacheTtlMs,
        data: rows,
        };

        return rows;
    }


    private contains(value: string, query?: string): boolean {
        if (!query) return true;
        return value.toLowerCase().includes(query.toLowerCase());
  }
}