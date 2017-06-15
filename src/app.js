import { UPLOAD_PATH_FOLDER, PORT} from 'babel-dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import peopleController from './controllers/people-controller'; 

// app
const app = express(); 
app.listen(PORT, () => { 
    console.log(`listening on port ${PORT}!`);
});
app.use(cors());

// serve static images in upload folder
app.use('/'+UPLOAD_PATH_FOLDER, express.static(path.join(__dirname, UPLOAD_PATH_FOLDER)));

// add people controller
app.use(peopleController);

