const createTunnel = require("../config/ssh-tunnel");
const dotenv = require("dotenv");
dotenv.config();

let requiro_test, requiro_moratemprana, requiro_multiple3;
let sshTunnel; // Almacenar la instancia del servidor del túnel
let closeTunnelFunction;

const setupKnexConnections = async () => {
  const tunnelInfo = await createTunnel();
  sshTunnel = tunnelInfo.server;
  closeTunnelFunction = tunnelInfo.close;

  requiro_test = require("knex")({
    client: "mysql",
    connection: {
      host: process.env.HOSTDB,
      port: process.env.PORTDB,
      user: process.env.USERDB,
      password: process.env.PASSWORDDB,
      database: "requiro_test",
    },
    pool: {
      min: 2, // Número mínimo de conexiones en el pool
      max: 10, // Número máximo de conexiones en el pool
      acquireTimeoutMillis: 1500000, // Tiempo de espera para obtener una conexión (25 minutos)
    },
  });

  requiro_moratemprana = require("knex")({
    client: "mysql",
    connection: {
      host: process.env.HOSTDB,
      port: process.env.PORTDB,
      user: process.env.USERDB,
      password: process.env.PASSWORDDB,
      database: "requiro_moratemprana",
    },
    pool: {
      min: 2, // Número mínimo de conexiones en el pool
      max: 10, // Número máximo de conexiones en el pool
      acquireTimeoutMillis: 1500000, // Tiempo de espera para obtener una conexión (25 minutos)
    },
  });

  requiro_multiple3 = require("knex")({
    client: "mysql",
    connection: {
      host: process.env.HOSTDB,
      port: process.env.PORTDB,
      user: process.env.USERDB,
      password: process.env.PASSWORDDB,
      database: "requiro_multiple3",
    },
    pool: {
      min: 2, // Número mínimo de conexiones en el pool
      max: 10, // Número máximo de conexiones en el pool
      acquireTimeoutMillis: 1500000, // Tiempo de espera para obtener una conexión (25 minutos)
    },
  });

  console.log("Knex connections established.");
};



const closeTunnel = () => {
  if (sshTunnel) {
    sshTunnel.close();
    console.log("SSH tunnel closed");
  }
};

module.exports = {
  setupKnexConnections,
  closeTunnel,
  getRequiroTest: () => requiro_test,
  getRequiroMoratemprana: () => requiro_moratemprana,
  getRequiroMultiple3: () => requiro_multiple3,
};
