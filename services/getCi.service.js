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

    console.log(`🔍 Buscando CI: ${ci} en las bases de datos con múltiples JOINs...`);

    // Se agrega un LEFT JOIN con customer_debt usando customer.id = customer_debt.idCustomer
    const [resultTest, resultMoraTemprana, resultMultiple3] = await Promise.all([
      dbTest("customer")
        .leftJoin("customer_debt", "customer.id", "customer_debt.idCustomer")
        .leftJoin("item_queue", "customer.id", "item_queue.idCustomer")
        .leftJoin("queue_user", "item_queue.idQueue", "queue_user.idQueue")
        .leftJoin("users", "queue_user.idUser", "users.id")
        .select(
          "customer.*",
          "customer_debt.*", // Selecciona los campos de deuda (ajusta según lo que necesites)
          "item_queue.idQueue",
          "queue_user.idUser",
          "users.user_name"
        )
        .where("customer.ci", ci)
        .first(),

      dbMoraTemprana("customer")
        .leftJoin("customer_debt", "customer.id", "customer_debt.idCustomer")
        .leftJoin("item_queue", "customer.id", "item_queue.idCustomer")
        .leftJoin("queue_user", "item_queue.idQueue", "queue_user.idQueue")
        .leftJoin("users", "queue_user.idUser", "users.id")
        .select(
          "customer.*",
          "customer_debt.*",
          "item_queue.idQueue",
          "queue_user.idUser",
          "users.user_name"
        )
        .where("customer.ci", ci)
        .first(),

      dbMultiple3("customer")
        .leftJoin("customer_debt", "customer.id", "customer_debt.idCustomer")
        .leftJoin("item_queue", "customer.id", "item_queue.idCustomer")
        .leftJoin("queue_user", "item_queue.idQueue", "queue_user.idQueue")
        .leftJoin("users", "queue_user.idUser", "users.id")
        .select(
          "customer.*",
          "customer_debt.*",
          "item_queue.idQueue",
          "queue_user.idUser",
          "users.user_name"
        )
        .where("customer.ci", ci)
    ]);

    let finalResults = [];

    // Agregar todos los registros de requiro_multiple3 (si existen)
    if (Array.isArray(resultMultiple3) && resultMultiple3.length > 0) {
      resultMultiple3.forEach((record) => {
        finalResults.push({
          db: "requiro_multiple3",
          source: record.source,
          data: record,
        });
      });
    }

    // Si ambos resultTest y resultMoraTemprana existen, elegir el más reciente
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

    // Retorna la información de deuda obtenida
    return { message: "Datos de deuda obtenidos correctamente", data: finalResults };
  } catch (error) {
    console.error("❌ Error en getDebtService:", error.message);
    throw new Error("Error interno al buscar la deuda en las bases de datos.");
  }
};

module.exports = getDebtService;
