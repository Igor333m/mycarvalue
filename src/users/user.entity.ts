import { Entity, Column,
  PrimaryGeneratedColumn,
  AfterInsert,
  AfterUpdate, AfterRemove } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  email: string

  @Column()
  password: string

  @AfterInsert() // Hooks decorators
  logInsert() {
    console.log('New user added:', this.id)
  }

  @AfterUpdate()
  logUpdate() {
    console.log('User with id updated:', this.id)
  }

  @AfterRemove()
  logRemove() {
    console.log('User removed with id:', this.id)
  }
}