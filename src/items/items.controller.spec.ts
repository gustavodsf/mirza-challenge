import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

describe('ItemsController', () => {
  let controller: ItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [ItemsService],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
  });

  it('should create an item', () => {
    const item = controller.create({
      name: 'Test item',
      price: 10,
    });

    expect(item.id).toBeDefined();
    expect(item.name).toBe('Test item');
    expect(item.price).toBe(10);
  });

  it('should list created items', () => {
    controller.create({ name: 'Another item', price: 5 });
    expect(controller.findAll().length).toBeGreaterThan(0);
  });
});
