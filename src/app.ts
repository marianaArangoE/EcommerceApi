import express from "express";

import routes from "./infrastructure/web/http/express/routes";

const app = express();


app.use(express.json());


app.use("/api/v1", routes);

app.use((req, res) => res.status(404).json({ error: "Not Found", path: req.originalUrl }));

export default app;
