import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import Loki from 'lokijs';
import shortid from 'shortid';
import { imageFilter } from './utils/filter';
import { loadCollection } from './utils/collection';

// setup
const DB_NAME = 'db.json';
const COLLECTION_NAME = 'images';
const UPLOAD_PATH_FOLDER = 'uploads';
const UPLOAD_PATH = path.join(__dirname, UPLOAD_PATH_FOLDER);
const memStorage = multer.memoryStorage();
const upload = multer({ dest: `${UPLOAD_PATH}/`, fileFilter: imageFilter, storage: memStorage }); // multer configuration
const db = new Loki(`${UPLOAD_PATH}/${DB_NAME}`, { persistenceMethod: 'fs' });

// app
const app = express(); 
app.use(cors());
console.log(UPLOAD_PATH);
const port = process.env.PORT || 3000;
app.listen(port, function () { 
    console.log(`listening on port ${port}!`);
});
app.use('/'+UPLOAD_PATH_FOLDER, express.static(UPLOAD_PATH));

async function createThumbnail(buffer, fileName){
    const filePath = path.join(UPLOAD_PATH, fileName);
    const maxSize = 256;
    sharp(buffer)
        .resize(maxSize, maxSize)
        .toFile(filePath);
}


app.post('/peopleadd', upload.single('image'), async function (req, res) {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        const fileName = (req.file && req.file.buffer) ? shortid.generate() : null;
        const data = col.insert(
            { 
                image: fileName,
                userInfo: {
                    'name': req.body.name,
                    'email': req.body.email,
                    'geo': JSON.parse(req.body.geo)
                }
            }
        );

        db.saveDatabase();

        if (fileName)
            createThumbnail(req.file.buffer, fileName);
        
        res.send({ id: data.$loki, fileName: data.image, userInfo: data.userInfo });
    } catch (err) {
        res.sendStatus(400);
    }
})

function transformPeopleCollection(req, data){
    return data.map(userData => {
        return {
            image: (userData.image) ? req.protocol + '://' + req.get('host') + '/' + UPLOAD_PATH_FOLDER + '/' + userData.image : null, 
            name: userData.userInfo.name,
            lat: userData.userInfo.geo.lat,
            lng: userData.userInfo.geo.lng
        }
    }).filter(userData => userData !== null);
}

app.get('/people', async (req, res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        res.send(transformPeopleCollection(req, col.data));
    } catch (err) {
        res.sendStatus(400);
    }
})

