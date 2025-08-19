import { ColumnType, Generated } from "kysely"

export interface DB {
  users: UsersTable
}

export interface UsersTable {
  id: Generated<number>
  username: string
  password_hash: string
  is_admin: ColumnType<boolean, boolean | undefined, boolean | undefined>
}
