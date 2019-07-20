const fs = require('fs-extra');
const filepreview = require('filepreview');
const sizeOf = require('image-size');
const toolbox = require('./tools');
const postManager = require('./post')
const getVideoInfo = require('get-video-info')
const glob = require('glob')

exports.getBanners = (function getBanners(){
    var banners = glob.sync('public/staticImages/banners/*')
    var banner = banners[Math.floor(Math.random()*banners.length)];
    return(banner.slice(7,))
})

exports.uploadImage = (function uploadImage(image,time,isOP,req,res){

    var generatePreview = (function(size){
        //generate preview image dimensions
        var newName = time+'.'+extension;
        var previewDimensions = toolbox.previewResize(size,maximum);
        // make preview
        var path = image.path
        var str = 'public/images/s' + time + '.png';
        filepreview.generate(image.path, str, previewDimensions,function(err){
            if(err) console.log(err);
            fs.move(image.path, 'public/images/'+newName);
            var retObj = image;
            retObj.time = time;
            retObj.fileName = newName;
            retObj.fileDimensions = size.width + ' x ' + size.height;
            postManager.writePost(req.params,req.body,req.connection.remoteAddress,retObj,req,res);
        })
    });

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
        // use sizeOf if ext != webm else use get-video-info
        //var dimensions = sizeOf(image.path);
        var dimensions
        if(extension!='webm'){
            dimensions = sizeOf(image.path)
            generatePreview(dimensions);
        } else if(extension=='webm'){
            var info = getVideoInfo(image.path).then(info => {
                var myObj = {
                    height: info.streams[0].height,
                    width: info.streams[0].width
                }
                generatePreview(myObj)
            });
        }


    }
})

exports.verifyExtension = (function verifyExtension(ext){
    if(['jpg','jpeg','png','gif','bmp','webm'].indexOf(ext.toLowerCase()) > -1 ){
        return true
    } else {
        return false
    }
})

exports.deleteImage = (function deleteImage(post){
    fs.unlink('public/images/'+post);
    var preview = 's'+post
    preview = preview.split('.')[0]
    preview = preview + '.png'
    fs.unlink('public/images/'+preview);
})
