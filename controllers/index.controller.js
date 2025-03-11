const getDebtService = require("../services/getCi.service");
const getCiFromTeledataService = require("../services/getCi.service");

const getCiFromTeledata = async (req, res) => {
  try {
    const { ci } = req.params;

    if (!ci) {
      return res
        .status(400)
        .json({ error: "El campo ci etsa vacio o no es valido" });
    }

    const result = await getCiFromTeledataService(ci);

    if(result.data.length === 0) {
      return res.status(400).json({ error: "No se encontraron registros" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDebt = async (req, res) => {
  try {
    const { ci } = req.params;

    if (!ci) {
      return res
        .status(400)
        .json({ error: "El campo ci etsa vacio o no es valido" });
    }

    const result = await getDebtService(ci);

    if(result.data.length === 0) {
      return res.status(400).json({ error: "No se encontraron registros" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getCiFromTeledata,
  getDebt
};