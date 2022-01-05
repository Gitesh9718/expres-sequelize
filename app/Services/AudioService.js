const { exec } = require('child_process');
// const path = require('path');
const fs = require('fs');

module.exports = {
    optimizeAudioQuality
};

function optimizeAudioQuality (originalAudioPath, originalAudioKey, outputFile) {
    const newAudioKey = originalAudioKey.split('.')[0] + '.mp3';
    const inputFile = originalAudioPath + originalAudioKey;

    if (!outputFile) {
        outputFile = 'public/tmp/' + newAudioKey;
    }
    const command = 'ffmpeg -i ' + inputFile + ' -c:a libmp3lame -b:a 64k ' + outputFile;

    return new Promise((resolve, reject) => {
        return exec(command, function (err, stdout, stderr) {
            if (!err) {
                // move new audio file to original path and delete original audio(if new audio have some size)
                if (fs.statSync(outputFile).size) {
                    fs.renameSync(outputFile, originalAudioPath + newAudioKey);
                    if (originalAudioKey !== newAudioKey) {
                        fs.unlinkSync(inputFile);
                    }
                }

                return resolve(newAudioKey);
            } else {
                return reject(err);
            }
        }
        );
    });
}
