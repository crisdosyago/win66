// imports
  import os from 'os';
  import path from 'path';
  import fs from 'fs';
  import {fileURLToPath} from 'url';

  import express from 'express';
  import multer from 'multer';
  import formidable from 'formidable';

// constants
  const APP_ROOT = path.dirname(fileURLToPath(import.meta.url));

// multer up load related
  const uploadDir = path.resolve(os.homedir(), 'win66-uploads');

  if ( ! fs.existsSync(uploadDir) ) {
    fs.mkdirSync(uploadDir, {recursive:true});
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(uploadDir, path.dirname(file.originalname)));
    },
    filename: (req, file, cb) => cb(null, nextFilename(file.originalname))
  });

  const upload = multer({
    storage,
    onError(err, next) {
      console.warn("File upload", err);
      next(err);
    }
  });

// express http app related
  const app = express();
	
	app.use(express.static(path.resolve(APP_ROOT, 'public')));

  app.post("/files", async (req, res) => {
    const form = formidable({multiples:true});
    await new Promise(then => {
      form.parse(req, (err, fields, files) => {
        if ( err ) {
          return next(err);
        } 
        for( const file of files.package ) {
          if ( ! file.name ) continue;
          const fileName = path.basename(file.name);
          const filePath = path.dirname(file.name).split('/');
          if ( ! fs.existsSync(path.resolve(uploadDir, ...filePath)) ) {
            fs.mkdirSync(path.resolve(uploadDir,...filePath), {recursive:true});
          }
          fs.renameSync(file.path, path.resolve(uploadDir, ...filePath, fileName))  
          //console.log(`Installed ${path.resolve(uploadDir, ...filePath, fileName)}`);
        }
        then(res.end("Upload complete"));
      });
    });
  });

  app.get("/files/*", async (req, res) => {
    res.type('json');
    const dirPath = req.params[0];
    let files, err;
    try {
      files = fs.readdirSync(path.resolve(uploadDir, ...dirPath.split('/')), {withFileTypes:true});
      files = files.map(f => {
        return {
          name: f.name,
          type: getType(f),
          fullPath: dirPath + '/' + f.name
        };
      });
      //console.log({files, dirPath})
    } catch(e) {
      err = e;
      console.warn("Files err", err); 
    } finally {
      res.end(JSON.stringify({files, err}));
    }
  });

  app.get("/filecontent/*", async (req, res) => {
    let filePath = req.params[0]; 
    if ( filePath.startsWith('/') ) {
      filePath = filePath.slice(1);
    }
    const fullPath = path.resolve(uploadDir, filePath);
    if ( filePath && fs.existsSync(fullPath) ) {
      res.sendFile(fullPath);
    } else {
      res.sendStatus(404);
    }
  });

  app.listen(8080, err => {

  });

// helpers
  function getType( dirent ) {
    if ( dirent.isBlockDevice() ) {
      return 'block_dev';
    } else if ( dirent.isCharacterDevice() ) {
      return 'char_dev';
    } else if ( dirent.isDirectory() ) {
      return 'dir';
    } else if ( dirent.isFIFO() ) {
      return 'fifo';
    } else if ( dirent.isFile() ) {
      return 'file';
    } else if ( dirent.isSocket() ) {
      return 'socket';
    } else if ( dirent.isSymbolicLink() ) {
      return 'link';
    } else {
      console.warn("Dirent has unkown type", dirent);
      return 'unknown';
    }
  }

	function nextFilename(name) {
    if ( ! fs.existsSync(path.resolve(uploadDir, name))) {
      return path.basename(name);
    } else { 
      name = path.basename(name);
    }

    const ext = path.extname(name);
    const strippedName = name.slice(0,-ext.length);
    const newName = `${name}-${Date.now()}${ext}`;
    return newName;
	}
