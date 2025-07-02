const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'admin', 'attendant'),
      allowNull: false,
      defaultValue: 'attendant',
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: true, // Super admin não tem tenant
      references: {
        model: 'stores',
        key: 'id'
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
  }, {
    tableName: 'users',
    paranoid: true, // Soft delete
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  });

  User.prototype.checkPassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.associate = function(models) {
    // Associação com Store (tenant)
    User.belongsTo(models.Store, {
      foreignKey: 'tenant_id',
      as: 'tenant'
    });

    // Associações de auditoria
    User.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    User.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return User;
};

