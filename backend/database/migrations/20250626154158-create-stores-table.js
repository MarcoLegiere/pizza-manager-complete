
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('stores', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      neighborhood: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      zip_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      logo_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      primary_color: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '#FF6B35',
      },
      secondary_color: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '#2E86AB',
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('stores');
  }
};

