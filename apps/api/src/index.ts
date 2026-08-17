import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`[whisperlag-api] listening on http://localhost:${env.PORT}`);
});
