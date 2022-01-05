/**
 * Created by manoj on 18/9/19.
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

module.exports = {
    getImageMetaData: getImageMetaData,
    resizeImageAccordingToHeight: resizeImageAccordingToHeight,
    resizeBase64AccordingToHeight: resizeBase64AccordingToHeight,
    compressImage: compressImage,
    compressAndResizeImageAccordingToHeight: compressAndResizeImageAccordingToHeight
};

function getImageMetaData(imagePath) {
    const image = sharp(imagePath);

    return image.metadata();
}

function resizeImageAccordingToHeight(imagePath, height, outputFile) {
    let isMovedToOriginalPlace = false;
    if (!outputFile) {
        outputFile = 'public/tmp/' + path.basename(imagePath);
        isMovedToOriginalPlace = true;
    }

    const image = sharp(imagePath)
        .rotate()
        .resize({height: height, withoutEnlargement: true})
        .toFile(outputFile);

    if (!isMovedToOriginalPlace) {
        return image;
    }
    return image.then(info => {
        fs.renameSync(outputFile, imagePath);
        return new Promise(resolve => resolve(info));
    })
}

async function resizeBase64AccordingToHeight(base64, height) {
    return sharp(Buffer.from(base64, 'base64'))
        .rotate()
        .resize({height: height, withoutEnlargement: true})
        .toBuffer();
}

function compressImage(imagePath, outputFile) {
    //if no outputFile
    if (!outputFile) {
        outputFile = 'public/tmp/' + path.basename(imagePath);
    }
    
    return sharp(imagePath)
        .jpeg({progressive: true, force: false})
        .png({progressive: true, force: false})
        .toFile(outputFile);
}

 async function compressAndResizeImageAccordingToHeight(imagePath, height, outputFile){
   // let isMovedToOriginalPlace = false;

    if (!outputFile) {
        outputFile = 'public/tmp/' + path.basename(imagePath);
        //isMovedToOriginalPlace = true;
    }

   return sharp(imagePath)
    .rotate()
    .resize({height: height, withoutEnlargement: true})
    .toFile(outputFile)
    .then(info1 => {
        fs.renameSync(outputFile, imagePath);
        return new Promise(resolve => resolve(info1));
    })
    .then(info1 => {
        let previousSize = info1.size;
        // console.log('last');
        // console.log('path ', imagePath);
       const image = sharp(imagePath)
            .jpeg({progressive: true, force: false})
            .png({progressive: true, force: false})
            .toFile(outputFile);

           return image.then(info => {
             if(parseInt(previousSize) < parseInt(info.size)){
                fs.unlinkSync(outputFile);
                return new Promise(resolve => resolve(info1));
             }
             else{
                fs.renameSync(outputFile, imagePath);
                return new Promise(resolve => resolve(info));
             }
           })
        })
}
