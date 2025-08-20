import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  username!: string

  @Column()
  password!: string

  @Column({ default: false })
  admin!: boolean
}
