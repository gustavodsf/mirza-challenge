import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ProfileService } from './profile.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, ProfileService],
})
export class UsersModule {}
