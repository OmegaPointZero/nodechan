const fs = require('fs-extra');
const filepreview = require('filepreview');
const sizeOf = require('image-size');
const toolbox = require('./tools');
const im = require('imagemagick')

exports.uploadImage = (function imageUpload(image,time,isOP){

    var maximum;
    isOP == true ? maximum = 250 : maximum = 125 

    //get uploaded file's dimensions
    var dimensions = sizeOf(image.path)
    //generate preview image dimensions
    var temp = image.originalname.split('.')
    var ext = temp[temp.length-1]
    var newName = time+'.'+ext
    console.log(`temp: ${temp}\next: ${ext}\nnewName: ${newName}`)
    var previewDimensions = toolbox.previewResize(dimensions,maximum)    
    console.log(previewDimensions)
    // make preview
    console.log(`image.path: ${image.path}`)
    var path = image.path
    var str = 'public/images/s' + time + '.png'
    filepreview.generate(image.path, str, previewDimensions,function(err){
        if(err) throw err;
        fs.move(image.path, 'public/images/'+newName)
    })
    
    var retObj = image;
    retObj.time = time;
    retObj.fileName = newName
    retObj.fileDimensions = dimensions.width + ' x ' + dimensions.height

    return retObj;
})

exports.verifyExtension = (function verifyExtension(ext){
    if(['jpg','jpeg','png','gif','bmp','webm'].indexOf(ext.toLowerCase()) > -1 ){
        return true
    } else {
        return false
    }
})
