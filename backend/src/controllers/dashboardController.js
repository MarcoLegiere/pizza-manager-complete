const { Order, OrderItem, Product, Customer, Store } = require('../models');
const { Op } = require('sequelize');
const { getTenantFilter } = require('../middleware/tenantMiddleware');

const getStats = async (req, res, next) => {
  try {
    const tenantFilter = getTenantFilter(req);
    
    // Datas para cálculos
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Pedidos de hoje
    const todayOrders = await Order.findAll({
      where: {
        ...tenantFilter,
        created_at: {
          [Op.gte]: startOfToday
        }
      }
    });

    // Pedidos do mês
    const monthlyOrders = await Order.findAll({
      where: {
        ...tenantFilter,
        created_at: {
          [Op.gte]: startOfMonth
        }
      }
    });

    // Pedidos ativos (não entregues nem cancelados)
    const activeOrders = await Order.count({
      where: {
        ...tenantFilter,
        status: {
          [Op.in]: ['pending', 'preparing', 'out_for_delivery']
        }
      }
    });

    // Pedidos por status
    const pendingOrders = await Order.count({
      where: { ...tenantFilter, status: 'pending' }
    });

    const preparingOrders = await Order.count({
      where: { ...tenantFilter, status: 'preparing' }
    });

    const outForDeliveryOrders = await Order.count({
      where: { ...tenantFilter, status: 'out_for_delivery' }
    });

    const deliveredTodayOrders = await Order.count({
      where: {
        ...tenantFilter,
        status: 'delivered',
        created_at: {
          [Op.gte]: startOfToday
        }
      }
    });

    // Cálculos financeiros
    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const averageTicket = monthlyOrders.length > 0 ? monthlyRevenue / monthlyOrders.length : 0;

    const stats = {
      todayOrders: todayOrders.length,
      todayRevenue: parseFloat(todayRevenue.toFixed(2)),
      activeOrders,
      pendingOrders,
      preparingOrders,
      outForDeliveryOrders,
      deliveredTodayOrders,
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      monthlyOrders: monthlyOrders.length,
      averageTicket: parseFloat(averageTicket.toFixed(2))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const getRecentOrders = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const tenantFilter = getTenantFilter(req);

    const orders = await Order.findAll({
      where: tenantFilter,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name']
          }]
        }
      ]
    });

    // Formatar dados para o frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer.name,
      total: parseFloat(order.total),
      status: order.status,
      createdAt: order.created_at,
      items: order.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price)
      }))
    }));

    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    next(error);
  }
};

const getChartData = async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    const tenantFilter = getTenantFilter(req);

    let startDate;
    let groupBy;
    
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'DATE(created_at)';
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupBy = 'DATE(created_at)';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'DATE(created_at)';
    }

    const orders = await Order.findAll({
      where: {
        ...tenantFilter,
        created_at: {
          [Op.gte]: startDate
        },
        status: {
          [Op.ne]: 'cancelled'
        }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
        [sequelize.fn('SUM', sequelize.col('total')), 'revenue']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    // Formatar dados para gráficos
    const chartData = orders.map(item => ({
      date: item.date,
      orders: parseInt(item.orders),
      revenue: parseFloat(item.revenue || 0)
    }));

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    next(error);
  }
};

const getTopProducts = async (req, res, next) => {
  try {
    const { limit = 10, period = 'month' } = req.query;
    const tenantFilter = getTenantFilter(req);

    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const topProducts = await OrderItem.findAll({
      where: {
        ...tenantFilter,
        created_at: {
          [Op.gte]: startDate
        }
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price']
        },
        {
          model: Order,
          as: 'order',
          where: {
            status: {
              [Op.ne]: 'cancelled'
            }
          },
          attributes: []
        }
      ],
      attributes: [
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue']
      ],
      group: ['product_id', 'product.id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: parseInt(limit)
    });

    const formattedProducts = topProducts.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      unitPrice: parseFloat(item.product.price),
      totalQuantity: parseInt(item.dataValues.totalQuantity),
      totalRevenue: parseFloat(item.dataValues.totalRevenue || 0)
    }));

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats: getStats,
  getRecentOrders,
  getChartData,
  getTopProducts
};

