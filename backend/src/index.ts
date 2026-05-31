import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import adminRoutes from './routes/adminRoutes';
import petRoutes from './routes/petRoutes';
import lifeCycleRoutes from './routes/lifeCycleRoutes';
import userRoutes from './routes/userRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import engagementRoutes from './routes/engagementRoutes';
import { initDB } from './db';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5005;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/lifecycle', lifeCycleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/engagement', engagementRoutes);

app.get('/', (req, res) => {
  res.send('Pet Adoption API (MySQL) is running');
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize MySQL database:', error);
    process.exit(1);
  });
