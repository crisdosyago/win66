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

  app.listen(8080, err => {

  });

// helpers
	function nextFileName(ext = '') {
		//console.log({nextFileName:{ext}});
		if ( ! ext.startsWith('.') ) {
			ext = '.' + ext;
		}
		const name = `file${(Math.random()*1000000).toString(36)}${ext}`;
		//console.log({nextFileName:{name}});
		return name;
	}
