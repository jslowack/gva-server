import sharp from 'sharp';

export const createThumbnail = (originalFile, fileName) => {
    console.log(originalFile);
    console.log(fileName);
    const maxSize = 256;
    sharp(originalFile)
        .rotate()
        .resize(maxSize, maxSize) 
        .toFile(fileName);
};
