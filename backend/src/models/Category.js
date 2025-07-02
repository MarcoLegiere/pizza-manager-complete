const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: 'categories',
    paranoid: true, // Soft delete
    indexes: [
      {
        fields: ['tenant_id', 'name'],
        unique: true,
        name: 'categories_tenant_name_unique'
      },
      {
        fields: ['tenant_id', 'sort_order']
      }
    ]
  });

  Category.associate = function(models) {
    // Associação com Store (tenant)
    Category.belongsTo(models.Store, {
      foreignKey: 'tenant_id',
      as: 'tenant'
    });

    // Associação com Products
    Category.hasMany(models.Product, {
      foreignKey: 'category_id',
      as: 'products'
    });

    // Associações de auditoria
    Category.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    Category.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return Category;
};

