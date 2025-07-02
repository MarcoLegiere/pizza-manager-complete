const { Order, OrderItem, Product, Customer } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {
      status: {
        [Op.ne]: 'cancelled'
      }
    };

    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Vendas por período (últimos 7 dias)
    const salesByPeriod = await Order.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('SUM', col('total')), 'total_sales'],
        [fn('COUNT', col('id')), 'total_orders']
      ],
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        status: {
          [Op.ne]: 'cancelled'
        }
      },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']]
    });

    // Faturamento mensal
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Order.sum('total', {
      where: {
        created_at: {
          [Op.gte]: currentMonth
        },
        status: {
          [Op.ne]: 'cancelled'
        }
      }
    }) || 0;

    // Pedidos no mês
    const monthlyOrders = await Order.count({
      where: {
        created_at: {
          [Op.gte]: currentMonth
        }
      }
    });

    // Ticket médio
    const avgTicket = await Order.findOne({
      attributes: [
        [fn('AVG', col('total')), 'average']
      ],
      where: {
        status: {
          [Op.ne]: 'cancelled'
        }
      }
    });

    // Pedidos hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const ordersToday = await Order.count({
      where: {
        created_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    res.json({
      success: true,
      data: {
        salesByPeriod,
        monthlyRevenue: parseFloat(monthlyRevenue),
        monthlyOrders,
        averageTicket: parseFloat(avgTicket?.dataValues?.average || 0),
        ordersToday
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTopProducts = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const topProducts = await OrderItem.findAll({
      attributes: [
        'product_id',
        [fn('SUM', col('quantity')), 'total_quantity'],
        [fn('SUM', col('total_price')), 'total_revenue']
      ],
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price']
      }],
      group: ['product_id', 'product.id'],
      order: [[fn('SUM', col('quantity')), 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    next(error);
  }
};

const getDailyReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    const reportDate = date ? new Date(date) : new Date();
    reportDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(reportDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const whereClause = {
      created_at: {
        [Op.gte]: reportDate,
        [Op.lt]: nextDay
      }
    };

    // Estatísticas do dia
    const dailyStats = await Order.findOne({
      attributes: [
        [fn('COUNT', col('id')), 'total_orders'],
        [fn('SUM', col('total')), 'total_revenue'],
        [fn('AVG', col('total')), 'average_ticket']
      ],
      where: {
        ...whereClause,
        status: {
          [Op.ne]: 'cancelled'
        }
      }
    });

    // Pedidos por status
    const ordersByStatus = await Order.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      where: whereClause,
      group: ['status']
    });

    // Métodos de pagamento
    const paymentMethods = await Order.findAll({
      attributes: [
        'payment_method',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('total')), 'total']
      ],
      where: {
        ...whereClause,
        status: {
          [Op.ne]: 'cancelled'
        }
      },
      group: ['payment_method']
    });

    res.json({
      success: true,
      data: {
        date: reportDate.toISOString().split('T')[0],
        stats: dailyStats?.dataValues || {},
        ordersByStatus,
        paymentMethods
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesReport,
  getTopProducts,
  getDailyReport
};

