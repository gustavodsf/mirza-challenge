import { Controller, Get, Query } from '@nestjs/common';
import { SearchUsersDto } from './dto/search.user.dto';
import { UsersService } from './users.service';

@Controller("/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("/search")
  async searchUsers(@Query() query: SearchUsersDto) {
    return this.usersService.searchUsers(query);
  }
}
