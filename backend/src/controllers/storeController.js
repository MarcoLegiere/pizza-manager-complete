const { Store } = require("../models");

const getStores = async (req, res, next) => {
  try {
    const stores = await Store.findAll({
      where: { active: true },
      order: [["name", "ASC"]],
    });

    res.json({
      success: true,
      data: stores,
    });
  } catch (error) {
    next(error);
  }
};

const getStoreById = async (req, res, next) => {
  try {
    const store = await Store.findByPk(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Estabelecimento não encontrado",
      });
    }

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

const createStore = async (req, res, next) => {
  try {
    const store = await Store.create(req.body);

    res.status(201).json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

const updateStore = async (req, res, next) => {
  try {
    const store = await Store.findByPk(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Estabelecimento não encontrado",
      });
    }

    await store.update(req.body);

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

const deleteStore = async (req, res, next) => {
  try {
    const store = await Store.findByPk(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Estabelecimento não encontrado",
      });
    }

    await store.update({ active: false });

    res.json({
      success: true,
      message: "Estabelecimento desativado com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
};

