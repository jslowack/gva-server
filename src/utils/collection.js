import * as del from 'del';
import * as Loki from 'lokijs';
import { UPLOAD_PATH_FOLDER } from 'babel-dotenv';

const loadCollection = function (colName, db) {
    return new Promise(resolve => {
        db.loadDatabase({}, () => {
            const _collection = db.getCollection(colName) || db.addCollection(colName);
            resolve(_collection);
        })
    }).catch((error) => {
        console.log(error);
    });
}

const transformPeopleCollection = function(req, data){
    return data.map((userData, index) => {
        return {
            id: userData.$loki,
            image: (userData.image) ? req.protocol + '://' + req.get('host') + '/' + UPLOAD_PATH_FOLDER + '/' + userData.image : null, 
            name: userData.userInfo.name,
            lat: userData.userInfo.geo.lat,
            lng: userData.userInfo.geo.lng
        }
    }).filter(userData => userData !== null);
}

export { loadCollection, transformPeopleCollection }