import { Body, Controller, Delete,
  Get,
  Param, Patch, Post, Query,
  NotFoundException,
  HttpCode,
  Session
} from '@nestjs/common'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDTO } from './dtos/update-user.dto'
import { UsersService } from './users.service'
import { AuthService } from './auth.service'
import { User } from './user.entity'
import { Serialize } from 'src/interceptors/serialize.interceptor'
import { UserDto } from 'src/users/dtos/user.dto'

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}

  @Get('/whoami')
  whoAmI(@Session() session: any) {
    return this.usersService.findOne(session.userId)
  }

  @Post('/signout')
  signOut(@Session() session: any) {
    session.userId = null
  }

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body.email, body.password)
    session.userId = user.id
    return user
  }

  @Post('/signin')
  @HttpCode(200)
  async signin(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password)
    session.userId = user.id
    return user
  }
  
  @Get('/:id')
  async findUser(@Param('id') id: string): Promise<User|null> {
    const user = await this.usersService.findOne(Number(id))
    if(!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  @Get()
  findAllUsersEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email)
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDTO) {
    return this.usersService.update(Number(id), body)
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(Number(id))
  }
}