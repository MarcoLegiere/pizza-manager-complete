'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // IDs fixos para referências
    const storeId1 = uuidv4();
    const storeId2 = uuidv4();
    const superAdminId = uuidv4();
    const admin1Id = uuidv4();
    const admin2Id = uuidv4();
    const attendant1Id = uuidv4();
    const category1Id = uuidv4();
    const category2Id = uuidv4();
    const category3Id = uuidv4();
    const category4Id = uuidv4();
    const product1Id = uuidv4();
    const product2Id = uuidv4();
    const product3Id = uuidv4();
    const product4Id = uuidv4();
    const customer1Id = uuidv4();
    const customer2Id = uuidv4();
    const customer3Id = uuidv4();
    const order1Id = uuidv4();
    const order2Id = uuidv4();
    const order3Id = uuidv4();

    // 1. Stores (Estabelecimentos)
    await queryInterface.bulkInsert('stores', [
      {
        id: storeId1,
        name: 'Jukinhas Bar',
        description: 'Bar e petiscaria com as melhores pizzas da cidade',
        phone: '(11) 99999-9999',
        email: 'contato@jukinhasbar.com',
        address: 'Rua das Flores, 123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
        logo_url: null,
        primary_color: '#FF6B35',
        secondary_color: '#2E86AB',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: storeId2,
        name: 'Pizza Express',
        description: 'Delivery de pizzas rápido e saboroso',
        phone: '(11) 88888-8888',
        email: 'contato@pizzaexpress.com',
        address: 'Av. Paulista, 456',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01310-100',
        logo_url: null,
        primary_color: '#E74C3C',
        secondary_color: '#3498DB',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 2. Users (Usuários)
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await queryInterface.bulkInsert('users', [
      {
        id: superAdminId,
        email: 'admin@pizza.com',
        password: hashedPassword,
        name: 'Super Administrador',
        role: 'super_admin',
        tenant_id: null, // Super admin não tem tenant específico
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: admin1Id,
        email: 'admin@jukinhasbar.com',
        password: hashedPassword,
        name: 'Admin Jukinhas',
        role: 'admin',
        tenant_id: storeId1,
        active: true,
        created_by: superAdminId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: admin2Id,
        email: 'admin@pizzaexpress.com',
        password: hashedPassword,
        name: 'Admin Pizza Express',
        role: 'admin',
        tenant_id: storeId2,
        active: true,
        created_by: superAdminId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: attendant1Id,
        email: 'atendente@jukinhasbar.com',
        password: hashedPassword,
        name: 'Atendente Jukinhas',
        role: 'attendant',
        tenant_id: storeId1,
        active: true,
        created_by: admin1Id,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 3. Categories (Categorias)
    await queryInterface.bulkInsert('categories', [
      {
        id: category1Id,
        tenant_id: storeId1,
        name: 'Pizzas Tradicionais',
        description: 'Nossas pizzas clássicas e tradicionais',
        sort_order: 1,
        active: true,
        created_by: admin1Id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: category2Id,
        tenant_id: storeId1,
        name: 'Pizzas Especiais',
        description: 'Pizzas especiais da casa',
        sort_order: 2,
        active: true,
        created_by: admin1Id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: category3Id,
        tenant_id: storeId2,
        name: 'Pizzas Doces',
        description: 'Pizzas doces irresistíveis',
        sort_order: 1,
        active: true,
        created_by: admin2Id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: category4Id,
        tenant_id: storeId2,
        name: 'Bebidas',
        description: 'Refrigerantes e sucos',
        sort_order: 2,
        active: true,
        created_by: admin2Id,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 4. Products (Produtos)
    await queryInterface.bulkInsert('products', [
      {
        id: product1Id,
        tenant_id: storeId1,
        category_id: category1Id,
        name: 'Pizza Margherita',
        description: 'Molho de tomate, mussarela, manjericão e azeite',
        price: 35.90,
        cost_price: 18.00,
        preparation_time: 25,
        sort_order: 1,
        active: true,
        created_by: admin1Id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: product2Id,
        tenant_id: storeId1,
        category_id: category2Id,
        name: 'Pizza Jukinhas Especial',
        description: 'Molho especial, mussarela, calabresa, cebola, pimentão e azeitona',
        price: 42.90,
        cost_price: 22.00,
        preparation_time: 30,
        sort_order: 1,
        active: true,
        created_by: admin1Id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: product3Id,
        tenant_id: storeId2,
        category_id: category3Id,
        name: 'Pizza Chocolate',
        description: 'Chocolate ao leite derretido com morangos',
        price: 28.90,
        cost_price: 15.00,
        preparation_time: 20,
        sort_order: 1,
        active: true,
        created_by: admin2Id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: product4Id,
        tenant_id: storeId2,
        category_id: category4Id,
        name: 'Coca-Cola 2L',
        description: 'Refrigerante Coca-Cola 2 litros',
        price: 8.90,
        cost_price: 4.50,
        stock_quantity: 50,
        track_stock: true,
        preparation_time: 0,
        sort_order: 1,
        active: true,
        created_by: admin2Id,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 5. Customers (Clientes)
    await queryInterface.bulkInsert('customers', [
      {
        id: customer1Id,
        tenant_id: storeId1,
        name: 'João Silva',
        phone: '(11) 91234-5678',
        email: 'joao@email.com',
        address: 'Rua A, 123',
        neighborhood: 'Vila Nova',
        city: 'São Paulo',
        zip_code: '01234-567',
        active: true,
        created_by: attendant1Id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: customer2Id,
        tenant_id: storeId1,
        name: 'Maria Santos',
        phone: '(11) 98765-4321',
        email: 'maria@email.com',
        address: 'Rua B, 456',
        neighborhood: 'Centro',
        city: 'São Paulo',
        zip_code: '01234-567',
        active: true,
        created_by: attendant1Id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: customer3Id,
        tenant_id: storeId2,
        name: 'Pedro Oliveira',
        phone: '(11) 95555-5555',
        email: 'pedro@email.com',
        address: 'Av. C, 789',
        neighborhood: 'Jardins',
        city: 'São Paulo',
        zip_code: '01234-567',
        active: true,
        created_by: admin2Id,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 6. Orders (Pedidos)
    await queryInterface.bulkInsert('orders', [
      {
        id: order1Id,
        tenant_id: storeId1,
        customer_id: customer1Id,
        order_number: '0001',
        status: 'delivered',
        order_type: 'delivery',
        subtotal: 35.90,
        delivery_fee: 5.00,
        discount: 0.00,
        total: 40.90,
        payment_method: 'cash',
        payment_status: 'paid',
        delivery_address: 'Rua A, 123 - Vila Nova',
        delivery_time: new Date(),
        created_by: attendant1Id,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        updated_at: new Date()
      },
      {
        id: order2Id,
        tenant_id: storeId1,
        customer_id: customer2Id,
        order_number: '0002',
        status: 'preparing',
        order_type: 'delivery',
        subtotal: 42.90,
        delivery_fee: 5.00,
        discount: 2.90,
        total: 45.00,
        payment_method: 'card',
        payment_status: 'paid',
        delivery_address: 'Rua B, 456 - Centro',
        estimated_delivery: new Date(Date.now() + 30 * 60 * 1000), // 30 min
        created_by: attendant1Id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: order3Id,
        tenant_id: storeId2,
        customer_id: customer3Id,
        order_number: '0001',
        status: 'pending',
        order_type: 'pickup',
        subtotal: 37.80,
        delivery_fee: 0.00,
        discount: 0.00,
        total: 37.80,
        payment_method: 'pix',
        payment_status: 'pending',
        created_by: admin2Id,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 7. Order Items (Itens do Pedido)
    await queryInterface.bulkInsert('order_items', [
      {
        id: uuidv4(),
        tenant_id: storeId1,
        order_id: order1Id,
        product_id: product1Id,
        quantity: 1,
        unit_price: 35.90,
        total_price: 35.90,
        created_by: attendant1Id,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        tenant_id: storeId1,
        order_id: order2Id,
        product_id: product2Id,
        quantity: 1,
        unit_price: 42.90,
        total_price: 42.90,
        created_by: attendant1Id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        tenant_id: storeId2,
        order_id: order3Id,
        product_id: product3Id,
        quantity: 1,
        unit_price: 28.90,
        total_price: 28.90,
        created_by: admin2Id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        tenant_id: storeId2,
        order_id: order3Id,
        product_id: product4Id,
        quantity: 1,
        unit_price: 8.90,
        total_price: 8.90,
        created_by: admin2Id,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Remover dados na ordem inversa das dependências
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('customers', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('stores', null, {});
  }
};

