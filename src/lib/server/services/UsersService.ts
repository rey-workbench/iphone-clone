import { UsersRepository } from '../repositories/UsersRepository';

export class UsersService {
  private repository: UsersRepository;

  constructor() {
    this.repository = new UsersRepository();
  }

  async getAllUsers() {
    return await this.repository.findAll();
  }
}
