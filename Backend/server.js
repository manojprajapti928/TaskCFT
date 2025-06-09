const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const {connectDB,sequelize} = require('./config/db');
const path = require('path');

const userRoutes = require('./routes/userRoutes');




const app = express();


const port = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api',userRoutes)

sequelize.sync()
    .then(() => {
        console.log('Database synchronized successfully');
    })
    .catch((error) => {
        console.error('Error synchronizing database:', error);
    });



connectDB()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
    });


app.listen(port,()=>{
    console.log(
        `Server is running on http://localhost:${port}`
    )
})