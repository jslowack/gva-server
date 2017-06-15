import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import Loki from 'lokijs';
import { loadCollection, transformPeopleCollection } from './../utils/collection';
import { createThumbnail } from './../utils/thumbnail';
import { imageFilter } from './../utils/filter';
import { UPLOAD_PATH_FOLDER, COLLECTION_NAME, DB_NAME } from 'babel-dotenv';

// setup
// @todo move multer stuff and db to separate classes
const UPLOAD_PATH = path.join(__dirname, '../', UPLOAD_PATH_FOLDER);
const upload = multer({ dest: `${UPLOAD_PATH}/`, fileFilter: imageFilter }); // multer configuration
const db = new Loki(`${UPLOAD_PATH}/${DB_NAME}`, { persistenceMethod: 'fs' });

async function peopleAdd(req, res) {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        const thumbName = (req.file && req.file.path) ?  req.file.filename+'thumb' : null;
        const fileName = (req.file && req.file.path) ? req.file.path+'thumb' : null;
        const data = col.insert(
            { 
                image: thumbName,
                userInfo: {
                    'name': req.body.name,
                    'email': req.body.email,
                    'geo': JSON.parse(req.body.geo)
                }
            }
        );
        db.saveDatabase();
        if (fileName)
            createThumbnail(req.file.path, fileName);
        
        res.send({ id: data.$loki, fileName: data.image, userInfo: data.userInfo });
    } catch (err) {
        res.sendStatus(400);
    }
};

async function peopleGet(req, res) {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        res.send(transformPeopleCollection(req, col.data));
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
};

const router = express.Router();
router.post('/peopleadd', upload.single('image'), peopleAdd);
router.get('/people', peopleGet); 

export default router;