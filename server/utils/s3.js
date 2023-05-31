"use strict";

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    signatureVersion: 'v4'
});
const fs = require('fs');

const S3_BUCKET   = process.env.S3_BUCKET;

const getFile = (path = "") => new Promise((resolve, reject) => {
    
    if (!path || !path.trim().length)
        throw new Error("No path provided")

    s3.getObject({
        Bucket: S3_BUCKET,
        Key: path
    }, (err, response) => {
        if (err) {
            return reject(err)
        }
        console.log("[s3] got file")
        if(response.hasOwnProperty("Body"))
            resolve(response.Body)
        else
            reject(new Error("No body in S3 response for " + path))
    })
})

const putFile = (path="", data = new Buffer(), type = "text/csv") => new Promise((resolve, reject) => {

    console.log("[s3] putting file")
    s3.putObject({
        Bucket: S3_BUCKET,
        Key: path,
        Body: data,
        ContentType: type,
        'ACL': 'private',
        'StorageClass': 'REDUCED_REDUNDANCY'
    }, (err, response) => {
        if (err){
            console.log(__line, 's3 put File  error', err)
            return reject(err)
        }
        console.log("[s3] put file")
        resolve(response.Body)
    })

})

const uploadFromStream = async (stream, path = "", bucket = conf.s3.bucket) => {

    if (!stream) {
        throw new Error("No stream provided")
    }

    if (!stream.pipe) {
        throw new Error("provide a read stream to the first param");
    }

    return new Promise((resolve, reject) => {

        let rejected = false;

        stream.on('error', function(err) {
            reject(err);
            rejected = true
        })

        const sstorage = new AWS.S3()

        sstorage.upload({
            Body: stream,
            Key: path,
            Bucket: S3_BUCKET
        })
        .on('httpUploadProgress', function(evt) { console.log(evt); })
        .send(function(err, data) { 

            if (rejected) {
                return
            }

            if (err) {
                console.log(err)
                return reject(err)
            }

            resolve(data)

        });

    })

}


/**
 * [description]
 * @param  {[type]} bucket           [description]
 * @param  {[type]} url              [description]
 * @param  {[type]} uploadedFileName [description]
 * @return {[type]}                  [description]
 */
const uploadToS3 = ( s3Path="", localFilePath="", option) => {

    if (!localFilePath || !localFilePath.trim().length) {
        return Promise.reject(new Error("Invalid local file destination path"));
    }

    if (!s3Path || !s3Path.trim().length) {
        return Promise.reject(new Error("Invalid S3 destination path"));
    }

    const body = fs.createReadStream(localFilePath);

    const s3Params = {
        Bucket: S3_BUCKET,
        Key: s3Path,
        Body: body
    };

    if (option && option.contentType && option.contentType.length) {
        s3Params.ContentType = option.contentType;
    }

    return s3
    .upload(s3Params)
    .promise()
    .then( () => 'Done uploading.')
    .catch(error => {
        return Promise.reject(error);
    })

}

/**
 * [description]
 * @param  {[type]} bucket             [description]
 * @param  {[type]} url                [description]
 * @param  {[type]} downloadedFileName [description]
 * @return {[type]}                    [description]
 */
const downloadFromS3 = ( s3Path = "", localFilePath = "" ) => {

    console.log("S3_BUCKET" , S3_BUCKET);

    if (!s3Path || !s3Path.trim().length) {
        return Promise.reject(new Error("Invalid S3 destination path"));
    }

    const s3Params = {
        Bucket: S3_BUCKET, 
        Key: s3Path, 
    };

    return s3
    .getObject(s3Params)
    .promise()
    .then( async data => {

        if (localFilePath.length) {

            return new Promise( (resolve, reject) => {

                fs.writeFile(localFilePath, data.Body, function(err) {

                    if (err) {
                        return reject(err);
                    }
                    else {
                        return resolve(localFilePath);
                    }
                });

            })

        }
        else {
            return data.Body.toString('utf-8');
        }
    })
    .catch(error => {
        return Promise.reject(error);
    });

}

const hasFile = ( url ) => {

    return new Promise((resolve, reject) => {

        s3.headObject({
            Bucket: S3_BUCKET,
            Key: url,
        }, (err, result) => {

            if (err)
                return reject(err)

            resolve(result)
        })
    })
}

const getFilePath = (filePath, minutes = 5) => {

    const signedUrlExpireSeconds = 60 * minutes;

    return new Promise((resolve, reject) => {

        s3.getSignedUrl('getObject', {
            Bucket: S3_BUCKET,
            Key: filePath,
            Expires: signedUrlExpireSeconds
        }, (err, result) => {

            if (err)
                return reject(err)

            resolve(result)
        })
    })
}

const getAllFiles = (filePath, finalResult = [], StartAfter = false) => {

    return new Promise((resolve, reject) => {

        let obj = {
            Bucket: S3_BUCKET,
            Prefix: filePath
        }

        if (StartAfter) {
            obj.StartAfter = StartAfter;
        }

        s3.listObjectsV2(obj, async (err, result) => {

            if (err)
                return reject(err)

            finalResult = [...finalResult, ...result.Contents];
            let contentLength = result.Contents.length;
            if (result.KeyCount < 1000) {
                return resolve(finalResult);
            }
            let recursive = await getAllFiles(filePath, finalResult, result.Contents[contentLength-1].Key);
        })
    })
}

const deleteFile = (filePath) => {
    try {

        let params = {
            Bucket: S3_BUCKET,
            Key: filePath
        };

        return  new Promise((resolve , reject)  =>  {
            s3.deleteObject(params, function (err, data) {

                if (err) {
                    console.log(__line, err, err.stack);
                    reject (err)
                }
                console.log(__line , data)
                resolve(true)
            })
        })

    }
    catch (err) {
        console.log(__line  , err);
        throw err;
    }

}


module.exports = {
    uploadToS3,
    downloadFromS3,
    hasFile,
    getFile,
    putFile,
    getFilePath,
    getAllFiles,
    deleteFile,
    uploadFromStream
}