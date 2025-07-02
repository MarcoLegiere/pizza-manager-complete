const { Category, Product, Store } = require('../models');
const { Op } = require('sequelize');
const { getTenantFilter } = require('../middleware/tenantMiddleware');

const getCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, active, include_products = false } = req.query;
    const offset = (page - 1) * limit;

    // Filtro base por tenant
    const whereClause = getTenantFilter(req);
    
    // Filtros adicionais
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (active !== undefined) {
      whereClause.active = active === 'true';
    }

    const includeOptions = [
      {
        model: Store,
        as: 'tenant',
        attributes: ['id', 'name']
      }
    ];

    if (include_products === 'true') {
      includeOptions.push({
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'price', 'active'],
        where: { active: true },
        required: false
      });
    }

    const categories = await Category.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      include: includeOptions
    });

    res.json({
      success: true,
      data: categories.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: categories.count,
        pages: Math.ceil(categories.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { include_products = false } = req.query;
    const whereClause = { id, ...getTenantFilter(req) };

    const includeOptions = [
      {
        model: Store,
        as: 'tenant',
        attributes: ['id', 'name']
      }
    ];

    if (include_products === 'true') {
      includeOptions.push({
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'price', 'description', 'image_url', 'active'],
        order: [['sort_order', 'ASC'], ['name', 'ASC']]
      });
    }

    const category = await Category.findOne({
      where: whereClause,
      include: includeOptions
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const {
      name,
      description,
      image_url,
      sort_order = 0
    } = req.body;

    // Validar se já existe categoria com mesmo nome no tenant
    const existingCategory = await Category.findOne({
      where: {
        name,
        ...getTenantFilter(req)
      }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Já existe uma categoria com este nome'
      });
    }

    const category = await Category.create({
      tenant_id: req.tenant?.id,
      name,
      description,
      image_url,
      sort_order,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      image_url,
      sort_order,
      active
    } = req.body;

    const category = await Category.findOne({
      where: { id, ...getTenantFilter(req) }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    // Validar nome único (exceto a própria categoria)
    if (name && name !== category.name) {
      const existingName = await Category.findOne({
        where: {
          name,
          id: { [Op.ne]: id },
          ...getTenantFilter(req)
        }
      });

      if (existingName) {
        return res.status(400).json({
          success: false,
          error: 'Já existe uma categoria com este nome'
        });
      }
    }

    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      image_url: image_url !== undefined ? image_url : category.image_url,
      sort_order: sort_order !== undefined ? sort_order : category.sort_order,
      active: active !== undefined ? active : category.active,
      updated_by: req.user.id
    });

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, ...getTenantFilter(req) }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    // Verificar se a categoria tem produtos
    const productCount = await Product.count({
      where: { category_id: id, ...getTenantFilter(req) }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível excluir categoria que possui produtos. Remova os produtos primeiro.'
      });
    }

    // Hard delete se não tem produtos
    await category.destroy({ force: true });

    res.json({
      success: true,
      message: 'Categoria removida com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantFilter = getTenantFilter(req);

    const category = await Category.findOne({
      where: { id, ...tenantFilter }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    // Contar produtos na categoria
    const totalProducts = await Product.count({
      where: { category_id: id, ...tenantFilter }
    });

    const activeProducts = await Product.count({
      where: { category_id: id, active: true, ...tenantFilter }
    });

    // Produtos mais vendidos da categoria (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const topProducts = await Product.findAll({
      where: { category_id: id, ...tenantFilter },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          where: {
            created_at: {
              [Op.gte]: thirtyDaysAgo
            }
          },
          required: false
        }
      ],
      attributes: [
        'id',
        'name',
        'price',
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('orderItems.quantity')), 0), 'totalSold']
      ],
      group: ['Product.id'],
      order: [[sequelize.fn('SUM', sequelize.col('orderItems.quantity')), 'DESC']],
      limit: 5
    });

    const stats = {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      topProducts: topProducts.map(product => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        totalSold: parseInt(product.dataValues.totalSold || 0)
      }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const reorderCategories = async (req, res, next) => {
  try {
    const { categories } = req.body; // Array de { id, sort_order }

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        error: 'Formato inválido. Esperado array de categorias.'
      });
    }

    const tenantFilter = getTenantFilter(req);

    // Atualizar ordem das categorias
    for (const categoryData of categories) {
      await Category.update(
        { 
          sort_order: categoryData.sort_order,
          updated_by: req.user.id
        },
        { 
          where: { 
            id: categoryData.id, 
            ...tenantFilter 
          } 
        }
      );
    }

    res.json({
      success: true,
      message: 'Ordem das categorias atualizada com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  reorderCategories
};

