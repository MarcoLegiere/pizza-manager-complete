const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
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
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    min_stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    track_stock: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    preparation_time: {
      type: DataTypes.INTEGER, // em minutos
      defaultValue: 0,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    tableName: 'products',
    paranoid: true, // Soft delete
    indexes: [
      {
        fields: ['tenant_id', 'name'],
        unique: true,
        name: 'products_tenant_name_unique'
      },
      {
        fields: ['tenant_id', 'sku'],
        unique: true,
        where: {
          sku: {
            [sequelize.Sequelize.Op.ne]: null
          }
        },
        name: 'products_tenant_sku_unique'
      },
      {
        fields: ['tenant_id', 'category_id']
      },
      {
        fields: ['tenant_id', 'active']
      }
    ]
  });

  Product.associate = function(models) {
    // Associação com Store (tenant)
    Product.belongsTo(models.Store, {
      foreignKey: 'tenant_id',
      as: 'tenant'
    });

    // Associação com Category
    Product.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });

    // Associação com OrderItems
    Product.hasMany(models.OrderItem, {
      foreignKey: 'product_id',
      as: 'orderItems'
    });

    // Associações de auditoria
    Product.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    Product.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return Product;
};

