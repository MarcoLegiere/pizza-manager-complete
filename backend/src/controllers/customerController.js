const { Customer, Order, Store } = require('../models');
const { Op } = require('sequelize');
const { getTenantFilter } = require('../middleware/tenantMiddleware');

const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, active } = req.query;
    const offset = (page - 1) * limit;

    // Filtro base por tenant
    const whereClause = getTenantFilter(req);
    
    // Filtros adicionais
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (active !== undefined) {
      whereClause.active = active === 'true';
    }

    const customers = await Customer.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
      include: [
        {
          model: Store,
          as: 'tenant',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      data: customers.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: customers.count,
        pages: Math.ceil(customers.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const whereClause = { id, ...getTenantFilter(req) };

    const customer = await Customer.findOne({
      where: whereClause,
      include: [
        {
          model: Store,
          as: 'tenant',
          attributes: ['id', 'name']
        },
        {
          model: Order,
          as: 'orders',
          limit: 10,
          order: [['created_at', 'DESC']],
          attributes: ['id', 'order_number', 'total', 'status', 'created_at']
        }
      ]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      neighborhood,
      city,
      zip_code,
      notes
    } = req.body;

    // Validar se já existe cliente com mesmo telefone no tenant
    const existingCustomer = await Customer.findOne({
      where: {
        phone,
        ...getTenantFilter(req)
      }
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um cliente com este telefone'
      });
    }

    // Validar email se fornecido
    if (email) {
      const existingEmail = await Customer.findOne({
        where: {
          email,
          ...getTenantFilter(req)
        }
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um cliente com este email'
        });
      }
    }

    const customer = await Customer.create({
      tenant_id: req.tenant?.id,
      name,
      phone,
      email,
      address,
      neighborhood,
      city,
      zip_code,
      notes,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      email,
      address,
      neighborhood,
      city,
      zip_code,
      notes,
      active
    } = req.body;

    const customer = await Customer.findOne({
      where: { id, ...getTenantFilter(req) }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    // Validar telefone único (exceto o próprio cliente)
    if (phone && phone !== customer.phone) {
      const existingPhone = await Customer.findOne({
        where: {
          phone,
          id: { [Op.ne]: id },
          ...getTenantFilter(req)
        }
      });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um cliente com este telefone'
        });
      }
    }

    // Validar email único (exceto o próprio cliente)
    if (email && email !== customer.email) {
      const existingEmail = await Customer.findOne({
        where: {
          email,
          id: { [Op.ne]: id },
          ...getTenantFilter(req)
        }
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um cliente com este email'
        });
      }
    }

    await customer.update({
      name: name || customer.name,
      phone: phone || customer.phone,
      email: email || customer.email,
      address: address || customer.address,
      neighborhood: neighborhood || customer.neighborhood,
      city: city || customer.city,
      zip_code: zip_code || customer.zip_code,
      notes: notes || customer.notes,
      active: active !== undefined ? active : customer.active,
      updated_by: req.user.id
    });

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: { id, ...getTenantFilter(req) }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    // Verificar se o cliente tem pedidos
    const orderCount = await Order.count({
      where: { customer_id: id, ...getTenantFilter(req) }
    });

    if (orderCount > 0) {
      // Soft delete se tem pedidos
      await customer.destroy();
    } else {
      // Hard delete se não tem pedidos
      await customer.destroy({ force: true });
    }

    res.json({
      success: true,
      message: 'Cliente removido com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantFilter = getTenantFilter(req);

    const customer = await Customer.findOne({
      where: { id, ...tenantFilter }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    // Estatísticas do cliente
    const orders = await Order.findAll({
      where: { 
        customer_id: id, 
        ...tenantFilter,
        status: { [Op.ne]: 'cancelled' }
      }
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Último pedido
    const lastOrder = await Order.findOne({
      where: { customer_id: id, ...tenantFilter },
      order: [['created_at', 'DESC']]
    });

    const stats = {
      totalOrders,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      lastOrderDate: lastOrder ? lastOrder.created_at : null,
      customerSince: customer.created_at
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Buscar cliente por telefone
const getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const tenantId = req.tenantId;

    const customer = await Customer.findOne({
      where: {
        tenant_id: tenantId,
        phone: phone,
        deleted_at: null
      },
      include: [{
        model: Order,
        as: 'orders',
        where: { deleted_at: null },
        required: false,
        limit: 5,
        order: [['created_at', 'DESC']]
      }]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Erro ao buscar cliente por telefone:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats
};

