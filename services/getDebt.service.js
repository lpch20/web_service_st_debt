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

    // Obtener las conexiones a las 3 bases
    const dbTest = getRequiroTest();
    const dbMoraTemprana = getRequiroMoratemprana();
    const dbMultiple3 = getRequiroMultiple3();

    console.log(`🔍 Buscando CI: ${ci} en las 3 bases de datos...`);

    // Se realizan las consultas sin .first() para obtener todos los registros
    const [resultsTest, resultsMoraTemprana, resultsMultiple3] = await Promise.all([
      dbTest("customer")
        .leftJoin("customer_debt", "customer.id", "customer_debt.idCustomer")
        .select(
          "customer.*",
          "customer_debt.*",
        )
        .where("customer.ci", ci),

      dbMoraTemprana("customer")
        .leftJoin("customer_debt", "customer.id", "customer_debt.idCustomer")
        .select(
          "customer.*",
          "customer_debt.*",
        )
        .where("customer.ci", ci),

      dbMultiple3("customer")
        .leftJoin("customer_debt", "customer.id", "customer_debt.idCustomer")
        .select(
          "customer.*",
          "customer_debt.*",
        )
        .where("customer.ci", ci),
    ]);

    // Combinar los resultados de las tres bases
    const finalResults = [
      ...resultsTest,
      ...resultsMoraTemprana,
      ...resultsMultiple3,
    ];

    console.log("🛑 Cerrando el túnel SSH...");
    await closeTunnel();
    console.log("✅ Túnel SSH cerrado correctamente.");

    return {
      message: "Datos de deuda obtenidos correctamente",
      data: finalResults,
    };
  } catch (error) {
    console.error("❌ Error en getDebtService:", error.message);
    await closeTunnel();
    throw new Error("Error interno al buscar la deuda en las bases de datos.");
  }
};

module.exports = getDebtService;
