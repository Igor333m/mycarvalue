import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let fakeRepo: Partial<Record<keyof Repository<User>, jest.Mock>>;

  beforeEach(async () => {
    fakeRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: fakeRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates and saves a new user', async () => {
      const user = { id: 1, email: 'a@test.com', password: 'pass' } as User;
      fakeRepo.create!.mockReturnValue(user);
      fakeRepo.save!.mockResolvedValue(user);

      const result = await service.create('a@test.com', 'pass');

      expect(fakeRepo.create).toHaveBeenCalledWith({ email: 'a@test.com', password: 'pass' });
      expect(fakeRepo.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe('findOne', () => {
    it('returns the user when found', async () => {
      const user = { id: 1, email: 'a@test.com', password: 'pass' } as User;
      fakeRepo.findOneBy!.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(fakeRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(user);
    });

    it('throws NotFoundException when id is falsy', () => {
      expect(() => service.findOne(0)).toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('returns users matching the email', async () => {
      const users = [{ id: 1, email: 'a@test.com', password: 'pass' } as User];
      fakeRepo.find!.mockResolvedValue(users);

      const result = await service.findByEmail('a@test.com');

      expect(fakeRepo.find).toHaveBeenCalledWith({ where: { email: 'a@test.com' } });
      expect(result).toEqual(users);
    });
  });

  describe('update', () => {
    it('updates and returns the user', async () => {
      const user = { id: 1, email: 'a@test.com', password: 'pass' } as User;
      const updated = { ...user, email: 'b@test.com' } as User;
      fakeRepo.findOneBy!.mockResolvedValue(user);
      fakeRepo.save!.mockResolvedValue(updated);

      const result = await service.update(1, { email: 'b@test.com' });

      expect(fakeRepo.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when user does not exist', async () => {
      fakeRepo.findOneBy!.mockResolvedValue(null);

      await expect(service.update(99, { email: 'x@test.com' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('removes and returns the user', async () => {
      const user = { id: 1, email: 'a@test.com', password: 'pass' } as User;
      fakeRepo.findOneBy!.mockResolvedValue(user);
      fakeRepo.remove!.mockResolvedValue(user);

      const result = await service.remove(1);

      expect(fakeRepo.remove).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });

    it('throws NotFoundException when user does not exist', async () => {
      fakeRepo.findOneBy!.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
