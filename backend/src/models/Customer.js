const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'stores',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    neighborhood: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zip_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'customers',
    paranoid: true, // Soft delete
    indexes: [
      {
        fields: ['tenant_id', 'phone'],
        unique: true,
        name: 'customers_tenant_phone_unique'
      },
      {
        fields: ['tenant_id', 'email'],
        unique: true,
        where: {
          email: {
            [sequelize.Sequelize.Op.ne]: null
          }
        },
        name: 'customers_tenant_email_unique'
      }
    ]
  });

  Customer.associate = function(models) {
    // Associação com Store (tenant)
    Customer.belongsTo(models.Store, {
      foreignKey: 'tenant_id',
      as: 'tenant'
    });

    // Associação com Orders
    Customer.hasMany(models.Order, {
      foreignKey: 'customer_id',
      as: 'orders'
    });

    // Associações de auditoria
    Customer.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    Customer.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return Customer;
};

