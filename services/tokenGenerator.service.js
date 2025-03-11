const jsonwebtoken = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

const generateNonExpiringToken = async(req, res) => {
  const jwt = jsonwebtoken.sign(
    {
      client_name: 'INVITADO'
    },
    process.env.AUTHUSER,
  );

  try {
    res.status(200).json({ message: "Inicio de sesión correcto", jwt });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la preferencia de pago' });
  }

};

module.exports = {
  generateNonExpiringToken
};
