export const imageFilter = (req, file, cb) => {
    // accept image only
    if (file && file.originalname && !file.originalname.match(/\.(jpg|jpeg|png|gif)$/g)) {
        console.log(file.originalname);
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
