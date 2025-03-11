const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require("dotenv");
const indexRoute = require('./routes/index.route');

app.use(express.json());

app.use(cors());

dotenv.config();

app.use('/api', indexRoute);


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


