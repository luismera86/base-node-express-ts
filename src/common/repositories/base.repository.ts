import { Repository, ObjectLiteral, FindOptionsWhere, UpdateResult } from "typeorm";

export class BaseRepository<T extends ObjectLiteral> {
  constructor(private readonly repository: Repository<T>) {}

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<T | null> {
    return this.repository.findOneBy({ id } as unknown as FindOptionsWhere<T>);
  }

  async create(data: T): Promise<T> {
    return this.repository.save(data);
  }

  async update(id: string, data: Partial<T>): Promise<UpdateResult> {
    return this.repository.update(id, data);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
