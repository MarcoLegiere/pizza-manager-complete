'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar tenant_id e campos de auditoria na tabela users
    await queryInterface.addColumn('users', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'stores',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('users', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('users', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('users', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Adicionar tenant_id e campos de auditoria na tabela customers
    await queryInterface.addColumn('customers', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'stores',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('customers', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('customers', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('customers', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Adicionar tenant_id e campos de auditoria na tabela categories
    await queryInterface.addColumn('categories', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'stores',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('categories', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('categories', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('categories', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Adicionar tenant_id e campos de auditoria na tabela products
    await queryInterface.addColumn('products', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'stores',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('products', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('products', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('products', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Adicionar tenant_id e campos de auditoria na tabela orders
    await queryInterface.addColumn('orders', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'stores',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('orders', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('orders', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('orders', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Adicionar tenant_id e campos de auditoria na tabela order_items
    await queryInterface.addColumn('order_items', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'stores',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('order_items', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('order_items', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('order_items', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Criar índices para otimização
    await queryInterface.addIndex('users', ['tenant_id']);
    await queryInterface.addIndex('customers', ['tenant_id', 'phone'], {
      unique: true,
      name: 'customers_tenant_phone_unique'
    });
    await queryInterface.addIndex('customers', ['tenant_id', 'email'], {
      unique: true,
      where: { email: { [Sequelize.Op.ne]: null } },
      name: 'customers_tenant_email_unique'
    });
    await queryInterface.addIndex('categories', ['tenant_id', 'name'], {
      unique: true,
      name: 'categories_tenant_name_unique'
    });
    await queryInterface.addIndex('categories', ['tenant_id', 'sort_order']);
    await queryInterface.addIndex('products', ['tenant_id', 'name'], {
      unique: true,
      name: 'products_tenant_name_unique'
    });
    await queryInterface.addIndex('products', ['tenant_id', 'sku'], {
      unique: true,
      where: { sku: { [Sequelize.Op.ne]: null } },
      name: 'products_tenant_sku_unique'
    });
    await queryInterface.addIndex('products', ['tenant_id', 'category_id']);
    await queryInterface.addIndex('products', ['tenant_id', 'active']);
    await queryInterface.addIndex('orders', ['tenant_id', 'order_number'], {
      unique: true,
      name: 'orders_tenant_number_unique'
    });
    await queryInterface.addIndex('orders', ['tenant_id', 'status']);
    await queryInterface.addIndex('orders', ['tenant_id', 'customer_id']);
    await queryInterface.addIndex('orders', ['tenant_id', 'created_at']);
    await queryInterface.addIndex('order_items', ['tenant_id', 'order_id']);
    await queryInterface.addIndex('order_items', ['tenant_id', 'product_id']);
  },

  async down(queryInterface, Sequelize) {
    // Remover índices
    await queryInterface.removeIndex('users', ['tenant_id']);
    await queryInterface.removeIndex('customers', 'customers_tenant_phone_unique');
    await queryInterface.removeIndex('customers', 'customers_tenant_email_unique');
    await queryInterface.removeIndex('categories', 'categories_tenant_name_unique');
    await queryInterface.removeIndex('categories', ['tenant_id', 'sort_order']);
    await queryInterface.removeIndex('products', 'products_tenant_name_unique');
    await queryInterface.removeIndex('products', 'products_tenant_sku_unique');
    await queryInterface.removeIndex('products', ['tenant_id', 'category_id']);
    await queryInterface.removeIndex('products', ['tenant_id', 'active']);
    await queryInterface.removeIndex('orders', 'orders_tenant_number_unique');
    await queryInterface.removeIndex('orders', ['tenant_id', 'status']);
    await queryInterface.removeIndex('orders', ['tenant_id', 'customer_id']);
    await queryInterface.removeIndex('orders', ['tenant_id', 'created_at']);
    await queryInterface.removeIndex('order_items', ['tenant_id', 'order_id']);
    await queryInterface.removeIndex('order_items', ['tenant_id', 'product_id']);

    // Remover colunas das tabelas
    const tables = ['users', 'customers', 'categories', 'products', 'orders', 'order_items'];
    const columns = ['tenant_id', 'created_by', 'updated_by', 'deleted_at'];

    for (const table of tables) {
      for (const column of columns) {
        await queryInterface.removeColumn(table, column);
      }
    }
  }
};

