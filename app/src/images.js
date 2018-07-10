const fs = require('fs-extra');
const filepreview = require('filepreview');
const sizeOf = require('image-size');
const toolbox = require('./tools');
const postManager = require('./post')

exports.uploadImage = (function uploadImage(image,time,isOP,req,res){

    var extension = image.originalname.split('.').last();
    var ext = exports.verifyExtension(extension);
    if(ext==false){
        console.log(`Bad file extension: ${extension}`)
        res.send('Bad file extension: ' + extension);
        //delete file if bad extension
        return
    } else if(ext==true){
        var maximum;
        isOP == true ? maximum = 250 : maximum = 125 ;
        //get uploaded file's dimensions
        var dimensions = sizeOf(image.path);
        //generate preview image dimensions
        var newName = time+'.'+extension;
        var previewDimensions = toolbox.previewResize(dimensions,maximum);
        // make preview
        var path = image.path
        var str = 'public/images/s' + time + '.png';
        filepreview.generate(image.path, str, previewDimensions,function(err){
            if(err) throw err;
            fs.move(image.path, 'public/images/'+newName);
        })
        var retObj = image;
        retObj.time = time;
        retObj.fileName = newName;
        retObj.fileDimensions = dimensions.width + ' x ' + dimensions.height;
        postManager.writePost(req.params,req.body,req.connection.remoteAddress,retObj,req,res);
    }
})

exports.verifyExtension = (function verifyExtension(ext){
    if(['jpg','jpeg','png','gif','bmp','webm'].indexOf(ext.toLowerCase()) > -1 ){
        return true
    } else {
        return false
    }
})
