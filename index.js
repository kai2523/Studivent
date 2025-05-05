const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Middleware zum Parsen von JSON-Daten
app.use(express.json());

// Beispielroute
app.get('/', (req, res) => {
  res.json({ staus: 200, message: 'Hello World!' });
});

// Server starten
app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
