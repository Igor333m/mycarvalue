import { Test } from '@nestjs/testing'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UsersService } from './users.service'
import { User } from './user.entity'

describe('AuthService', () => {
  let service: AuthService
  let fakeUserService: Partial<UsersService>
  
  beforeEach(async () => {
    // provide a default fake service; individual tests may override methods
    fakeUserService = {
      findByEmail: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    }
  
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService
        }
      ]
    }).compile()
  
    service = module.get(AuthService)
  })
  
  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined()
  })

  describe('signup', () => {
    it('creates a new user with salted and hashed password', async () => {
      // ensure no users exist yet
      fakeUserService.findByEmail = jest.fn().mockResolvedValue([])
      const createSpy = jest
        .fn()
        .mockImplementation((email: string, password: string) =>
          Promise.resolve({ id: 1, email, password } as User),
        )
      fakeUserService.create = createSpy

      const user = await service.signup('test@example.com', 'mypassword')

      expect(user.password).not.toEqual('mypassword')
      const [salt, hash] = user.password.split('.')
      expect(salt).toHaveLength(16) // 8 bytes in hex
      expect(hash).toHaveLength(64) // 32 bytes in hex
      expect(createSpy).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String),
      )
    })

    it('throws a BadRequestException if email is already registered', async () => {
      fakeUserService.findByEmail = jest.fn().mockResolvedValue([{ email: 'a@example.com', password: '1' }])

      await expect(service.signup('test@example.com', 'pass')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('signin', () => {
    it('throws UnauthorizedException if signin is called with an unused email', async () => {
      fakeUserService.findByEmail = jest.fn().mockResolvedValue([])

      await expect(service.signin('nonexistent@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('throws UnauthorizedException if an invalid password is provided', async () => {
      const salt = 'b31bb1da1faea44f'
      const storedHash = '14ddafb1bbd70b98aa895c18dd4eeffb5dfeb800d53afa59506ad90fdbf701ea'
      const hashedPassword = `${salt}.${storedHash}`
      
      fakeUserService.findByEmail = jest.fn().mockResolvedValue([
        { id: 1, email: 'invalid@example.com', password: hashedPassword } as User,
      ])

      await expect(service.signin('invalid@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('returns a user if correct password is provided', async () => {
      fakeUserService.findByEmail = jest.fn().mockResolvedValue([])
      const signupUser = await service.signup('test@example.com', 'mypassword')
      
      fakeUserService.findByEmail = jest.fn().mockResolvedValue([signupUser])

      const user = await service.signin('test@example.com', 'mypassword')
      
      expect(user).toBeDefined()
      expect(user.email).toEqual('test@example.com')
    })
  })
})