const getUserFromSheet = require("./getUserFromSheet.service"); // Importa la función
const {
  setupKnexConnections,
  closeTunnel,
  getRequiroTest,
  getRequiroMoratemprana,
  getRequiroMultiple3,
} = require("../db/stDb");

const getDebtService = async (ci) => {
  await setupKnexConnections();

  try {
    if (!ci) {
      throw new Error("El campo ci está vacío o no es válido");
    }

    const dbTest = getRequiroTest();
    const dbMoraTemprana = getRequiroMoratemprana();
    const dbMultiple3 = getRequiroMultiple3();

    console.log(
      `🔍 Buscando CI: ${ci} en las bases de datos con múltiples JOINs...`
    );

    // 🔹 Consultar en todas las bases de datos con JOINs adicionales
    const [resultTest, resultMoraTemprana, resultMultiple3] = await Promise.all(
      [
        dbTest("customer")
          .leftJoin("item_queue", "customer.id", "item_queue.idCustomer")
          .leftJoin("queue_user", "item_queue.idQueue", "queue_user.idQueue")
          .leftJoin("users", "queue_user.idUser", "users.id")
          .select(
            "customer.*",
            "item_queue.idQueue",
            "queue_user.idUser",
            "users.user_name"
          )
          .where("customer.ci", ci)
          .first(),

        dbMoraTemprana("customer")
          .leftJoin("item_queue", "customer.id", "item_queue.idCustomer")
          .leftJoin("queue_user", "item_queue.idQueue", "queue_user.idQueue")
          .leftJoin("users", "queue_user.idUser", "users.id")
          .select(
            "customer.*",
            "item_queue.idQueue",
            "queue_user.idUser",
            "users.user_name"
          )
          .where("customer.ci", ci)
          .first(),

        dbMultiple3("customer")
          .leftJoin("item_queue", "customer.id", "item_queue.idCustomer")
          .leftJoin("queue_user", "item_queue.idQueue", "queue_user.idQueue")
          .leftJoin("users", "queue_user.idUser", "users.id")
          .select(
            "customer.*",
            "item_queue.idQueue",
            "queue_user.idUser",
            "users.user_name"
          )
          .where("customer.ci", ci),
      ]
    );

    let finalResults = [];
    let userNames = new Set(); // Para almacenar los distintos user_name

    // ✅ Agregar todos los registros de requiro_multiple3
    if (Array.isArray(resultMultiple3) && resultMultiple3.length > 0) {
      resultMultiple3.forEach((record) => {
        finalResults.push({
          db: "requiro_multiple3",
          source: record.source,
          data: record,
        });
        if (record.user_name) userNames.add(record.user_name);
      });
    }

    // ✅ Si requiro_test y requiro_moratemprana están presentes, elegir el más reciente
    if (resultTest && resultMoraTemprana) {
      const moreRecent =
        resultTest.created > resultMoraTemprana.created
          ? resultTest
          : resultMoraTemprana;
      finalResults.push({
        db: moreRecent === resultTest ? "requiro_test" : "requiro_moratemprana",
        source: moreRecent.source,
        data: moreRecent,
      });
      if (moreRecent.user_name) userNames.add(moreRecent.user_name);
    } else if (resultTest) {
      finalResults.push({
        db: "requiro_test",
        source: resultTest.source,
        data: resultTest,
      });
      if (resultTest.user_name) userNames.add(resultTest.user_name);
    } else if (resultMoraTemprana) {
      finalResults.push({
        db: "requiro_moratemprana",
        source: resultMoraTemprana.source,
        data: resultMoraTemprana,
      });
      if (resultMoraTemprana.user_name)
        userNames.add(resultMoraTemprana.user_name);
    }

    console.log("🛑 Cerrando el túnel SSH...");
    await closeTunnel();
    console.log("✅ Túnel SSH cerrado correctamente.");

    // 🔍 Buscar los nombres en Google Sheets
    let googleSheetResults = [];
    if (userNames.size > 0) {
      const sheetData = await getUserFromSheet([...userNames]);
      googleSheetResults = sheetData.data;
    }

    // 🔹 Combinando la información de Google Sheets con la información de la base de datos
    const combinedResults = finalResults.map((record) => {
      const matchingSheetUser = googleSheetResults.find(
        (sheetUser) => sheetUser.user_name_ST === record.data.user_name
      );

      const portfolio2 = "VIEMVENTURA";
      const portfolio3 = "Cliente_3";
      const portfolio4 = "COPAC";
      const portfolio5 = "Creditos de la casa";
      const portfolio6 = "viemGI";
      const portfolio7 = "CCASA";
      const portfolio8 = "LATE";
      const portfolio9 = "EARLY";

      let cartera;

      if (record.source === portfolio2) {
        cartera = "Viemventura";
      } else if (record.source === portfolio3) {
        cartera = "Creditel";
      } else if (record.source === portfolio4) {
        cartera = "Copac";
      } else if (record.source === portfolio5) {
        cartera = "Creditos de la casa";
      } else if (record.source === portfolio6) {
        cartera = "Viemventura Gestion Inicial";
      } else if (record.source === portfolio7) {
        cartera = "Credito de la Casa";
      } else if (record.source === portfolio8) {
        cartera = "Creditos Directos Tardia";
      } else if (record.source === portfolio9) {
        cartera = "Creditos Directos Temprana";
      }

      return {
        cartera: cartera ? cartera : "No encontrado",
        user_ip_contact: matchingSheetUser
          ? matchingSheetUser.user_ip_contact
          : "No encontrado",
      };
    });

    console.log("🔍 Resultados combinados:", combinedResults);

    return { message: "Datos obtenidos correctamente", data: combinedResults };
  } catch (error) {
    console.error("❌ Error en getCiFromTeledataService:", error.message);
    throw new Error("Error interno al buscar la cédula en las bases de datos.");
  }
};

module.exports = getDebtService;
