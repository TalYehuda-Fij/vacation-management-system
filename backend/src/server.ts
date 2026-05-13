import { AppDataSource } from './config/data-source.js';
import { logger } from './config/logger.js';
import { app } from './app.js';

const PORT = Number(process.env.PORT ?? 3000);

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => logger.info(`Backend listening on :${PORT}`));
  })
  .catch((err) => {
    logger.error(err, 'Failed to connect to database');
    process.exit(1);
  });
