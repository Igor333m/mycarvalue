import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { CreateUserDto } from './dtos/create-user.dto'
import { UsersService } from './users.service'
import { User } from './user.entity'

@Controller('auth')
export class UsersController {

  constructor(private usersService: UsersService) {}

  @Post('/signup')
  createUser(@Body() body: CreateUserDto) {
    this.usersService.create(body.email, body.password)
  }

  @Get(':id')
  findUser(@Param('id') id: string): Promise<User|null> {

    console.log('id :', id)
    return this.usersService.findOne(Number(id))
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() body: Partial<User>) {
    return this.usersService.update(Number(id), body)
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(Number(id))
  }
}