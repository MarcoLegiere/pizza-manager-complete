const { Product, Category, Store, OrderItem } = require('../models');
const { Op } = require('sequelize');
const { getTenantFilter } = require('../middleware/tenantMiddleware');

const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category_id, active } = req.query;
    const offset = (page - 1) * limit;

    // Filtro base por tenant
    const whereClause = getTenantFilter(req);
    
    // Filtros adicionais
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (category_id) {
      whereClause.category_id = category_id;
    }
    
    if (active !== undefined) {
      whereClause.active = active === 'true';
    }

    const products = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
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
      data: products.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.count,
        pages: Math.ceil(products.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const whereClause = { id, ...getTenantFilter(req) };

    const product = await Product.findOne({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Store,
          as: 'tenant',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      cost_price,
      image_url,
      sku,
      stock_quantity = 0,
      min_stock = 0,
      track_stock = false,
      preparation_time = 0,
      sort_order = 0
    } = req.body;

    // Validar se a categoria pertence ao mesmo tenant
    const category = await Category.findOne({
      where: { id: category_id, ...getTenantFilter(req), active: true }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    // Validar se já existe produto com mesmo nome no tenant
    const existingProduct = await Product.findOne({
      where: {
        name,
        ...getTenantFilter(req)
      }
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um produto com este nome'
      });
    }

    // Validar SKU se fornecido
    if (sku) {
      const existingSku = await Product.findOne({
        where: {
          sku,
          ...getTenantFilter(req)
        }
      });

      if (existingSku) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um produto com este SKU'
        });
      }
    }

    const product = await Product.create({
      tenant_id: req.tenant?.id,
      category_id,
      name,
      description,
      price,
      cost_price,
      image_url,
      sku,
      stock_quantity,
      min_stock,
      track_stock,
      preparation_time,
      sort_order,
      created_by: req.user.id
    });

    // Buscar produto completo para retornar
    const completeProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: completeProduct
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      description,
      price,
      cost_price,
      image_url,
      sku,
      stock_quantity,
      min_stock,
      track_stock,
      preparation_time,
      sort_order,
      active
    } = req.body;

    const product = await Product.findOne({
      where: { id, ...getTenantFilter(req) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Validar categoria se fornecida
    if (category_id && category_id !== product.category_id) {
      const category = await Category.findOne({
        where: { id: category_id, ...getTenantFilter(req), active: true }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Categoria não encontrada'
        });
      }
    }

    // Validar nome único (exceto o próprio produto)
    if (name && name !== product.name) {
      const existingName = await Product.findOne({
        where: {
          name,
          id: { [Op.ne]: id },
          ...getTenantFilter(req)
        }
      });

      if (existingName) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um produto com este nome'
        });
      }
    }

    // Validar SKU único (exceto o próprio produto)
    if (sku && sku !== product.sku) {
      const existingSku = await Product.findOne({
        where: {
          sku,
          id: { [Op.ne]: id },
          ...getTenantFilter(req)
        }
      });

      if (existingSku) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um produto com este SKU'
        });
      }
    }

    await product.update({
      category_id: category_id || product.category_id,
      name: name || product.name,
      description: description || product.description,
      price: price !== undefined ? price : product.price,
      cost_price: cost_price !== undefined ? cost_price : product.cost_price,
      image_url: image_url !== undefined ? image_url : product.image_url,
      sku: sku !== undefined ? sku : product.sku,
      stock_quantity: stock_quantity !== undefined ? stock_quantity : product.stock_quantity,
      min_stock: min_stock !== undefined ? min_stock : product.min_stock,
      track_stock: track_stock !== undefined ? track_stock : product.track_stock,
      preparation_time: preparation_time !== undefined ? preparation_time : product.preparation_time,
      sort_order: sort_order !== undefined ? sort_order : product.sort_order,
      active: active !== undefined ? active : product.active,
      updated_by: req.user.id
    });

    // Buscar produto atualizado com relacionamentos
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id, ...getTenantFilter(req) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Verificar se o produto tem itens de pedido
    const orderItemCount = await OrderItem.count({
      where: { product_id: id, ...getTenantFilter(req) }
    });

    if (orderItemCount > 0) {
      // Soft delete se tem pedidos
      await product.destroy();
    } else {
      // Hard delete se não tem pedidos
      await product.destroy({ force: true });
    }

    res.json({
      success: true,
      message: 'Produto removido com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'set' } = req.body; // set, add, subtract

    const product = await Product.findOne({
      where: { id, ...getTenantFilter(req) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    if (!product.track_stock) {
      return res.status(400).json({
        success: false,
        error: 'Este produto não controla estoque'
      });
    }

    let newQuantity;
    
    switch (operation) {
      case 'add':
        newQuantity = product.stock_quantity + parseInt(quantity);
        break;
      case 'subtract':
        newQuantity = product.stock_quantity - parseInt(quantity);
        break;
      case 'set':
      default:
        newQuantity = parseInt(quantity);
        break;
    }

    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Estoque não pode ser negativo'
      });
    }

    await product.update({
      stock_quantity: newQuantity,
      updated_by: req.user.id
    });

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        previous_stock: product.stock_quantity,
        new_stock: newQuantity,
        operation,
        quantity: parseInt(quantity)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getLowStockProducts = async (req, res, next) => {
  try {
    const tenantFilter = getTenantFilter(req);

    const lowStockProducts = await Product.findAll({
      where: {
        ...tenantFilter,
        track_stock: true,
        active: true,
        [Op.and]: [
          sequelize.where(
            sequelize.col('stock_quantity'),
            Op.lte,
            sequelize.col('min_stock')
          )
        ]
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['stock_quantity', 'ASC']]
    });

    res.json({
      success: true,
      data: lowStockProducts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts
};

