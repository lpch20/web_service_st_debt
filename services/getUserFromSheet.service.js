const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
//const creds = require("../config/credentials.json");
const dotenv = require("dotenv");
dotenv.config();

const SHEET_ID = process.env.SHEET_ID;

const getUserFromSheet = async (userNames) => {
  try {
    console.log(`📄 Buscando en Google Sheets los usuarios con user_name: ${userNames}`);

    // 🔹 1️⃣ Configurar la autenticación con JWT
    const auth = new JWT({
      email: process.env.CLIENT_EMAIL,
      key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // 🔹 2️⃣ Conectar con Google Sheets
    const doc = new GoogleSpreadsheet(SHEET_ID, auth);
    await doc.loadInfo();

    // 🔹 3️⃣ Acceder a la primera hoja del documento
    const sheet = doc.sheetsByIndex[0];

    // 🔹 4️⃣ Cargar encabezados correctamente
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues.map(h => h.trim().toLowerCase()); // 🔥 Normalizar encabezados
    console.log("📌 Encabezados procesados:", headers);

    // 🔹 5️⃣ Obtener los índices de las columnas necesarias
    const stmotionIndex = headers.indexOf("usuario stmotion");
    const ipContactIndex = headers.indexOf("usuario ip-contact");

    if (stmotionIndex === -1 || ipContactIndex === -1) {
      console.error("❌ No se encontraron las columnas necesarias en los encabezados.");
      return { message: "Error: No se encontraron las columnas necesarias." };
    }

    // 🔹 6️⃣ Obtener todas las filas de la hoja
    const rows = await sheet.getRows();
    const allUsernames = rows.map(row => row._rawData[stmotionIndex]?.trim().toLowerCase());


    let results = [];

    // 🔹 7️⃣ Iterar sobre los nombres de usuario obtenidos de la base de datos
    for (const userName of userNames) {
      const cleanUserName = userName.trim().toLowerCase();
      console.log(`🔍 Buscando usuario: ${cleanUserName}`);

      // 🔍 Buscar en la columna específica "Usuario STMotion"
      const matchedIndex = allUsernames.findIndex(sheetUser => sheetUser === cleanUserName);

      if (matchedIndex !== -1) {
        const matchedRow = rows[matchedIndex];


        // 🔥 Obtener el usuario de "Usuario IP-Contact"
        let userIPContact = matchedRow._rawData[ipContactIndex]?.trim();
        if (!userIPContact) userIPContact = "No encontrado"; // ✅ Manejar valores vacíos

        results.push({
            user_name_ST: userName,
          user_ip_contact: userIPContact,
        });
      } else {
        console.log(`⚠️ No se encontró usuario para: ${userName}`);
        results.push({
          user_name_ST: userName,
          user_ip_contact: "No encontrado",
        });
      }
    }

    console.log(results)

    return { message: "Datos obtenidos correctamente", data: results };
  } catch (error) {
    console.error("❌ Error al buscar en Google Sheets:", error.message);
    throw new Error("Error interno al buscar el usuario en Google Sheets.");
  }
};

module.exports = getUserFromSheet;
