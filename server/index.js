const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const port = 8000;

const API_KEY_SID = "SK.0.cHtsUlygUPjWbD7f7Swhg6klcQmBHO";
const API_KEY_SECRET = "VW9NZzcwaHJtbG5MTjZDeW1IdDFPV1ZibEJKeGpoYw==";

app.get("/", (req, res) => {
  const username = req.query.u;
  if (!username) {
    res.json({ access_token: "" });
  } else {
    const now = Math.floor(Date.now() / 1000);
    const header = { cty: "stringee-api;v=1" };
    const payload = {
      jti: `${API_KEY_SID}-${now}`,
      iss: API_KEY_SID,
      exp: now + 3600,
      userId: username,
    };

    const token = jwt.sign(payload, API_KEY_SECRET, {
      algorithm: "HS256",
      header: header,
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({ access_token: token });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
