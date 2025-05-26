import path from 'path';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import adminRoutes from './routes/admin';
import { getConfig } from './config/rateLimitConfig';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const apiKey = req.headers['x-api-key'] as string;
  const adminKey = req.headers['x-admin-api-key'] as string;
  const displayKey = apiKey ? `API_KEY: ${apiKey.substring(0,5)}...` : (adminKey ? `ADMIN_KEY: ${adminKey.substring(0,5)}...` : `IP: ${req.ip}`);
  console.log(`[${timestamp}] ${req.method} ${req.url} (${displayKey})`);
  next();
});

app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);
// Serve static files from the "public" directory
app.use(express.static('public'));

// Added a route here to serve the scoreboard page
app.get('/scoreboard', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'scoreboard.html'));
});

app.get('/', (req: Request, res: Response) => {
  res.send(`
    <body style="background-color: #000; color: #0f0; font-family: 'Courier New', Courier, monospace; text-align: center; padding-top: 15%;">
      <pre style="font-size: 1.2em;">


 ▄▄▄·▄▄▄         ▄▄▄· ▄▄·       ▄▄▄   ▐ ▄      ▄▄▄· ▪  
▐█ ▄█▀▄ █·▪     ▐█ ▄█▐█ ▌▪▪     ▀▄ █·•█▌▐█    ▐█ ▀█ ██ 
 ██▀·▐▀▀▄  ▄█▀▄  ██▀·██ ▄▄ ▄█▀▄ ▐▀▀▄ ▐█▐▐▌    ▄█▀▀█ ▐█·
▐█▪·•▐█•█▌▐█▌.▐▌▐█▪·•▐███▌▐█▌.▐▌▐█•█▌██▐█▌    ▐█ ▪▐▌▐█▌
.▀   .▀  ▀ ▀█▄▀▪.▀   ·▀▀▀  ▀█▄▀▪.▀  ▀▀▀ █▪     ▀  ▀ ▀▀▀
                                        


 :: Adaptive Trust Protocol :: Online
      </pre>
    </body>
  `);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Unhandled Error: ${err.message}`);
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => {
  const config = getConfig();
  console.log(`[${new Date().toISOString()}] Server running on http://localhost:${PORT}`);
  if (!process.env.ADMIN_API_KEY) {
    console.warn(`[${new Date().toISOString()}] WARNING: ADMIN_API_KEY is not set. Admin routes are not secured.`);
  } else {
    console.log(`[${new Date().toISOString()}] Admin routes are protected. Use 'x-admin-api-key' header.`);
  }
  console.log(`[${new Date().toISOString()}] Default rate limit: ${config.default.points} requests / ${config.default.duration} seconds.`);
});

export default app;