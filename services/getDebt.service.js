const {
    setupKnexConnections,
    closeTunnel,
    getRequiroTest,
    getRequiroMoratemprana,
    getRequiroMultiple3,
  } = require("../db/stDb");
  
  const getClientsFromTeledataService = async (ci) => {
    await setupKnexConnections();
  
    try {
      if (!ci) {
        throw new Error("El campo ci está vacío o no es válido");
      }
  
      const dbTest = getRequiroTest();
      const dbMoraTemprana = getRequiroMoratemprana();
      const dbMultiple3 = getRequiroMultiple3();
  
      console.log(`🔍 Buscando CI: ${ci} en las bases de datos con múltiples JOINs...`);
  
      // Consultar en todas las bases de datos
      const [resultTest, resultMoraTemprana, resultMultiple3] = await Promise.all([
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
          .where("customer.ci", ci)
      ]);
  
      let finalResults = [];
  
      // Agregar todos los registros de requiro_multiple3 (si se obtuvieron)
      if (Array.isArray(resultMultiple3) && resultMultiple3.length > 0) {
        resultMultiple3.forEach((record) => {
          finalResults.push({
            db: "requiro_multiple3",
            source: record.source, // Asegúrate de que exista la propiedad "source" en el registro
            data: record,
          });
        });
      }
  
      // Si se obtuvieron resultados en requiro_test y requiro_moratemprana, elegir el más reciente
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
      } else if (resultTest) {
        finalResults.push({
          db: "requiro_test",
          source: resultTest.source,
          data: resultTest,
        });
      } else if (resultMoraTemprana) {
        finalResults.push({
          db: "requiro_moratemprana",
          source: resultMoraTemprana.source,
          data: resultMoraTemprana,
        });
      }
  
      console.log("🛑 Cerrando el túnel SSH...");
      await closeTunnel();
      console.log("✅ Túnel SSH cerrado correctamente.");
  
      return { message: "Datos obtenidos correctamente", data: finalResults };
    } catch (error) {
      console.error("❌ Error en getClientsFromTeledataService:", error.message);
      throw new Error("Error interno al buscar la cédula en las bases de datos.");
    }
  };
  
  module.exports = getClientsFromTeledataService;
  