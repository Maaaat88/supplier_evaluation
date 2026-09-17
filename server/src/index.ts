import { app } from './app.js';
import { env } from './env.js';

app.listen(env.PORT, () => {
  console.log(`API démarrée sur http://localhost:${env.PORT}`);
});
