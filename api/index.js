import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { default: app } = require('./server.cjs');
export default app;
