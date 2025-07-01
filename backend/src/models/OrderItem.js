const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
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
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'order_items',
    paranoid: true, // Soft delete
    indexes: [
      {
        fields: ['tenant_id', 'order_id']
      },
      {
        fields: ['tenant_id', 'product_id']
      }
    ]
  });

  OrderItem.associate = function(models) {
    // Associação com Store (tenant)
    OrderItem.belongsTo(models.Store, {
      foreignKey: 'tenant_id',
      as: 'tenant'
    });

    // Associação com Order
    OrderItem.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order'
    });

    // Associação com Product
    OrderItem.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });

    // Associações de auditoria
    OrderItem.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    OrderItem.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return OrderItem;
};

