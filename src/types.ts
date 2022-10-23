import { Model, InferAttributes, InferCreationAttributes, ForeignKey, CreationOptional, DataTypes, Sequelize } from 'sequelize'

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
})

// Class declarations

export class Person extends Model<InferAttributes<Person>, InferCreationAttributes<Person>> {
  declare id: string
  declare fullName: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare username: string
  declare hash: string
  declare fullName: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export class Domain extends Model<InferAttributes<Domain>, InferCreationAttributes<Domain>> {
  declare id: string
  declare ownerUsername: ForeignKey<User['username']>

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export class Metric extends Model<InferAttributes<Metric>, InferCreationAttributes<Metric>> {
  declare id: string
  declare domainId: ForeignKey<Domain['id']>
}

export class Dashboard extends Model<InferAttributes<Dashboard>, InferCreationAttributes<Dashboard>> {
  declare id: string
}

// Classes initializations

User.init(
  {
    username: {
      type: DataTypes.STRING(128),
      autoIncrement: false,
      primaryKey: true
    },
    hash: {
      type: new DataTypes.STRING(128),
      allowNull: false
    },
    fullName: {
      type: new DataTypes.STRING(256),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'users',
    sequelize
  }
)

// Associations

User.hasMany(Domain, {
  sourceKey: 'username',
  foreignKey: 'ownerUsername',
  as: 'domains'
})
