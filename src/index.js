import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import Loki from 'lokijs';
import { imageFilter } from './utils/filter';
import { loadCollection } from './utils/collection';

// setup
const DB_NAME = 'db.json';
const COLLECTION_NAME = 'images';
const UPLOAD_PATH = 'uploads';
const upload = multer({ dest: `${UPLOAD_PATH}/` }, { fileFilter: imageFilter }); // multer configuration
const db = new Loki(`${UPLOAD_PATH}/${DB_NAME}`, { persistenceMethod: 'fs' });

// app
const app = express();
app.use(cors());

const port = process.env.PORT || 9000;
app.listen(port, function () {
    console.log(`listening on port ${port}!`);
});


app.post('/people', [upload.single('image'), async function (req, res) {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        const data = col.insert(
            {
                image: req.file,
                userInfo: {
                    'name': req.body.name,
                    'email': req.body.email,
                    'geo': req.body.geo
                }
            }
        );

        db.saveDatabase();
        res.send({ id: data.$loki, fileName: data.image.filename, originalName: data.image.originalname, userInfo: data.userInfo });
    } catch (err) {
        res.sendStatus(400);
    }
}])

app.get('/images', async (req, res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        res.send(col.data);
    } catch (err) {
        res.sendStatus(400);
    }
})

