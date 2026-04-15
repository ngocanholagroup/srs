const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from Node.js Backend!');
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
