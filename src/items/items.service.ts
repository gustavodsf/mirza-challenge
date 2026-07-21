import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateItemDto } from './dto/create-item.dto';
import { Item } from './item.entity';

@Injectable()
export class ItemsService {
  private readonly items: Item[] = [];

  create(createItemDto: CreateItemDto): Item {
    const item: Item = {
      id: randomUUID(),
      ...createItemDto,
    };
    this.items.push(item);
    return item;
  }

  findAll(): Item[] {
    return this.items;
  }
}
