import 'dotenv/config';
import express from 'express';
import connectDB from './config/database.js';
import usersRoutes from './routes/users.js';
const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.use('/api/users', usersRoutes);

app.listen(PORT, ( ) => {
    console.log(`Nuestra Aplicacion esta funcionando en el puerto ${PORT}`);
});



