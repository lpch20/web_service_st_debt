const tunnel = require('tunnel-ssh');
const dotenv = require("dotenv");
dotenv.config();

const sshConfig = {
  username: process.env.USER_NAME,
  password: process.env.PASSWORDTUNNEL,
  host: process.env.HOSTTUNNEL,
  port: process.env.PORTTUNNEL,
  dstHost: process.env.HOSTDB, 
  dstPort: process.env.DSTPORTTUNNEL, 
  localHost: process.env.LOCALHOSTTUNNEL, 
  localPort: process.env.LOCALPORTTUNNEL, 
};

const createTunnel = () => {
  return new Promise((resolve, reject) => {
    const server = tunnel(sshConfig, (error) => {
      if (error) {
        console.error('SSH tunnel error:', error);
        reject(error);
      } else {
        console.log('SSH tunnel established');
        resolve({
          server,
          close: () => server.close()
        });
      }
    });

    server.on('close', () => console.log('SSH tunnel closed'));
    server.on('error', error => console.error('SSH tunnel error event:', error));
  });
};

module.exports = createTunnel;
