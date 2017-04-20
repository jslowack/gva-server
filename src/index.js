require("babel-core/register");
require("babel-polyfill");

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
const upload = multer({ dest: `${UPLOAD_PATH}/`, fileFilter: imageFilter }); // multer configuration
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

function createThumbnail(originalFile, fileName){
    console.log(originalFile);
    console.log(fileName);
    const maxSize = 256;
    sharp(originalFile)
        .resize(maxSize, maxSize)
        .toFile(fileName);
    console.log("end");
}


app.post('/peopleadd', upload.single('image'), async function (req, res) {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        const fileName = (req.file && req.file.path) ? req.file.path+'thumb' : null;
        console.log(req.file);
        const data = col.insert(
            { 
                image: req.file.filename+'thumb',
                userInfo: {
                    'name': req.body.name,
                    'email': req.body.email,
                    'geo': JSON.parse(req.body.geo)
                }
            }
        );
        console.log("e");
        
        db.saveDatabase();
        console.log("e")
        console.log(req.file.buffer)

        if (fileName)
            createThumbnail(req.file.path, fileName);
        
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

