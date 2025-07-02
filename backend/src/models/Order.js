const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
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
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    order_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    order_type: {
      type: DataTypes.ENUM('delivery', 'pickup', 'dine_in'),
      allowNull: false,
      defaultValue: 'delivery',
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'card', 'pix', 'transfer'),
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    delivery_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    delivery_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estimated_delivery: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'orders',
    paranoid: true, // Soft delete
    indexes: [
      {
        fields: ['tenant_id', 'order_number'],
        unique: true,
        name: 'orders_tenant_number_unique'
      },
      {
        fields: ['tenant_id', 'status']
      },
      {
        fields: ['tenant_id', 'customer_id']
      },
      {
        fields: ['tenant_id', 'created_at']
      }
    ]
  });

  Order.associate = function(models) {
    // Associação com Store (tenant)
    Order.belongsTo(models.Store, {
      foreignKey: 'tenant_id',
      as: 'tenant'
    });

    // Associação com Customer
    Order.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      as: 'customer'
    });

    // Associação com OrderItems
    Order.hasMany(models.OrderItem, {
      foreignKey: 'order_id',
      as: 'items'
    });

    // Associações de auditoria
    Order.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    Order.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return Order;
};

