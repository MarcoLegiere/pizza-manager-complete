const { Order, OrderItem, Customer, Product, Store } = require('../models');
const { Op } = require('sequelize');
const { getTenantFilter } = require('../middleware/tenantMiddleware');

const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, date, customer_id } = req.query;
    const offset = (page - 1) * limit;

    // Filtro base por tenant
    const whereClause = getTenantFilter(req);
    
    // Filtros adicionais
    if (status) {
      whereClause.status = status;
    }
    
    if (customer_id) {
      whereClause.customer_id = customer_id;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      whereClause.created_at = {
        [Op.gte]: startDate,
        [Op.lt]: endDate
      };
    }

    const orders = await Order.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price']
          }]
        },
        {
          model: Store,
          as: 'tenant',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      data: orders.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: orders.count,
        pages: Math.ceil(orders.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const whereClause = { id, ...getTenantFilter(req) };

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'email', 'address']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price', 'description']
          }]
        },
        {
          model: Store,
          as: 'tenant',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const {
      customer_id,
      items,
      order_type = 'delivery',
      delivery_address,
      delivery_fee = 0,
      discount = 0,
      notes,
      payment_method
    } = req.body;

    // Validar se o cliente pertence ao mesmo tenant
    const customer = await Customer.findOne({
      where: { id: customer_id, ...getTenantFilter(req) }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    // Validar produtos e calcular totais
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findOne({
        where: { id: item.product_id, ...getTenantFilter(req), active: true }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Produto ${item.product_id} não encontrado`
        });
      }

      const itemTotal = parseFloat(product.price) * parseInt(item.quantity);
      subtotal += itemTotal;

      validatedItems.push({
        ...item,
        tenant_id: req.tenant?.id,
        unit_price: product.price,
        total_price: itemTotal,
        created_by: req.user.id
      });
    }

    const total = subtotal + parseFloat(delivery_fee) - parseFloat(discount);

    // Gerar número do pedido
    const orderCount = await Order.count({
      where: getTenantFilter(req)
    });
    const orderNumber = `${String(orderCount + 1).padStart(4, '0')}`;

    // Criar pedido
    const order = await Order.create({
      tenant_id: req.tenant?.id,
      customer_id,
      order_number: orderNumber,
      order_type,
      subtotal,
      delivery_fee,
      discount,
      total,
      delivery_address,
      notes,
      payment_method,
      created_by: req.user.id
    });

    // Criar itens do pedido
    const orderItems = validatedItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    await OrderItem.bulkCreate(orderItems);

    // Buscar pedido completo para retornar
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price']
          }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: completeOrder
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status inválido'
      });
    }

    const order = await Order.findOne({
      where: { id, ...getTenantFilter(req) }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }

    await order.update({
      status,
      updated_by: req.user.id,
      ...(status === 'delivered' && { delivery_time: new Date() })
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, ...getTenantFilter(req) }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }

    // Soft delete
    await order.destroy();

    res.json({
      success: true,
      message: 'Pedido removido com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder: updateOrderStatus,
  cancelOrder: deleteOrder
};

