const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define("Store", {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: "stores",
  });

  Store.associate = function(models) {
    // Associações futuras podem ser adicionadas aqui
  };

  return Store;
};

