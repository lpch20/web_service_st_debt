const jwt = require("jsonwebtoken");
const dotenv = require( "dotenv");
dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  console.log("🔍 Token recibido:", authHeader); // Verificar qué se está recibiendo

  if (!authHeader) {
    res.status(401).json({ error: "Acceso al recurso denegado: Token no proporcionado" });
    return;
  }

  // ✅ Si el token empieza con "Bearer ", quitar ese prefijo
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    const verified = jwt.verify(token, process.env.AUTHUSER) ;

    req.user = verified; // ✅ Asignamos los datos del usuario


    next();
  } catch (error) {
    console.error("❌ Error en la verificación del token:", error);
    res.status(400).json({ error: "El token es inválido", mensaje: (error).message });
  }
};


module.exports = verifyToken;