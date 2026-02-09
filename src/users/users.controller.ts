import { Body, Controller, Delete, Get, Param, Patch, Post, Query, NotFoundException } from '@nestjs/common'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDTO } from './dtos/update-user.dto'
import { UsersService } from './users.service'
import { User } from './user.entity'

@Controller('auth')
export class UsersController {

  constructor(private usersService: UsersService) {}

  @Post('/signup')
  createUser(@Body() body: CreateUserDto) {
    this.usersService.create(body.email, body.password)
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