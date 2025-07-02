require('dotenv').config(); // carrega variáveis do .env
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // desativa logs para limpar o console
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco estabelecida com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar no banco:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
