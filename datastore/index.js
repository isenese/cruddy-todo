const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird')

var items = {};

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) =>{
    fs.writeFile(`${exports.dataDir}/${id}.txt`, text, () =>{
      if(err){
        callback(null, err)
      } else{
        items[id] = text;
        callback(null, {id, text})
      }
    })
  });

};


exports.readOne = (id, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, (err, text) =>{
    if (err) {
      console.log(err)
      callback(new Error(`No item with id: ${id}`));
    } else {
      //console.log({id, text: text}, 'this is coming from Read One')
      console.log(text.toString())
      callback(null, {id ,text:text.toString()});
      //{ id, text: todoText }
    }
    // if(err) {
    //   callback(null, err)
    // } else {
    //   callback(null, text.toString())
    // }
  })
};


var readOnePromise = Promise.promisify(exports.readOne);


exports.readAll = (callback) => {

  var readDirectory = () =>{
    return new Promise((resolve, reject) =>{
      fs.readdir (exports.dataDir, (err, files) => {
        if (err) {
          return reject(err);
        } else {
          // console.log(files)
          resolve(files)
        }
      })
    })
  }

  var filesToPromises = (files) =>{
    return files.map((file) =>{
      return new Promise((resolve, reject) =>{
        fs.readFile(`${exports.dataDir}/${file}`, (err, text) =>{
          if(err) {
            return reject(err)
          } else {
            console.log(text.toString())
            // data.push(text.toString())
            resolve({id:file.replace(/.txt$/, ''), text:text.toString()})
          }
        })
      })
    })
  }
  var errHandle = (err) =>{
    console.lof(err)
  }

  readDirectory()
    .then(filesToPromises)
    .all()
    .then((input) =>{ callback(null, input)})
    .catch(errHandle)
}


     







exports.update = (id, text, callback) => {
  fs.readdir(exports.dataDir, (err, files) =>{
    //console.log(id, 'id inside update')
    //console.log(files, ' files inside update')

    if(files.includes(id + '.txt')){
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err) =>{
        if(err){
          callback(err)
        } else {
          items[id] = text.toString()
          // console.log(id, text)
          callback(null, id, text.toString())
        }
      })
    } else {
      err = 'this is an error'
      callback(err)
      console.log(err)
    }
})

};

exports.delete = (id, callback) => {
  // var item = items[id];
  // delete items[id];
  fs.unlink(`${exports.dataDir}/${id}.txt`, (err) =>{
    if(err){
      callback(err)
    } else {
      callback(err, id)
    }
  })

};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////


