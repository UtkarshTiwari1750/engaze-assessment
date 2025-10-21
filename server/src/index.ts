import { DEFAULT_PORT } from "./constants/global.constants";
import express from "express";

const port = parseInt(process.env.PORT || DEFAULT_PORT);

async function startServer() {
  try {
    const app = express();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
