// imports
  import os from 'os';
  import path from 'path';
  import fs from 'fs';
  import {fileURLToPath} from 'url';

  import express from 'express';
  import multer from 'multer';

// constants
  const APP_ROOT = path.dirname(fileURLToPath(import.meta.url));

// multer up load related
  const uploadPath = path.resolve(os.homedir(), 'win66-uploads');

  if ( ! fs.existsSync(uploadPath) ) {
    fs.mkdirSync(uploadPath, {recursive:true});
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, nextFileName(path.extname(file.originalname)))
  });

  const upload = multer({storage});

// express http app related
  const app = express();
	
	app.use(express.static(path.resolve(APP_ROOT, 'public')));

  app.post("/files", upload.array("package", 10), async (req, res) => {
    res.end('Upload complete');
  });

  app.get("/files/*", async (req, res) => {
    res.type('json');
    const dirPath = req.params[0];
    let files, err;
    try {
      files = fs.readdirSync(path.resolve(uploadPath, ...dirPath.split('/')), {withFileTypes:true});
      files = files.map(f => ({name:f.name, type: getType(f)}));
      console.log({files, dirPath})
    } catch(e) {
      err = e;
      console.warn("Files err", err); 
    } finally {
      res.end(JSON.stringify({files, err}));
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

	function nextFileName(ext = '') {
		//console.log({nextFileName:{ext}});
		if ( ! ext.startsWith('.') ) {
			ext = '.' + ext;
		}
		const name = `file${(Math.random()*1000000).toString(36)}${ext}`;
		//console.log({nextFileName:{name}});
		return name;
	}
