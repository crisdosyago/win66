import {update, merge, toDOM} from './web_modules/bulgogi.js';

const State = {
  files: {}
};

// render functions
  const render = newFlatState => (merge(State, newFlatState), update(App, State, {useBody:true}));

  // call to render some files
    // note:
    // we need a different API for merging files because file paths may have '.' in them
    // which are treated as property path separators by merge
    // so we do our own merge
  const renderFiles = fileState => {
    Object.assign(State.files, fileState);
    update(App, State, {useBody:true});
  };

start();

async function start() {
  saveTime();
  self.acquireFile = acquireFile;
  self.modifyDrag = modifyDrag;
  await listFiles('');
  //setInterval(updateTime, 7500);
}

function saveTime() {
  const now = new Date;
  const datetime = now.toISOString();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', /*second:'2-digit'*/});

  merge(State, {
    now: { datetime, date, time }
  });
}

function updateTime() {
  saveTime();
  render({});
}

function App(state) {
  return `
    <body>
      <main class=desktop ondrop="acquireFile(event);" ondragover="modifyDrag(event);">
        <article class="file folder" tabindex=0>
          Trash
        </article>
        ${state.files[''] && state.files[''].map(FileView).join('\n')}
      </main>
      <nav class=footer>
        <section class=main-popups>
          <section class=win-button-popup>
            <button type=button name=win66 class="win-button popup-trigger">
              &#x229e; 
            </button>
            <article class="main popup">

            </article>
          </section>
          <section class=search-box-popup>
            <input type=text name=search autocomplete=off class="box popup-trigger" placeholder="Type here to search">
            <span class=search-icon>&#x2315;</span>
            <aside class=popup>
              <nav class=tabs>
                <ul>
                  <li><a href=#all>All</a>
                  <li><a href=#apps>Apps</a>
                  <li><a href=#documents>Documents</a>
                  <li><a href=#web>Web</a>
                  <li>
                    <a href=#more class=menu>More</a>
                    <ul class=menu-list> 
                      <li><a href=#more-email>Email</a>
                      <li><a href=#more-folders>Folders</a>
                      <li><a href=#more-music>Music</a>
                      <li><a href=#more-people>People</a>
                      <li><a href=#more-photos>Photos</a>
                      <li><a href=#more-settings>Settings</a>
                      <li><a href=#more-videos>Videos</a>
                    </ul>
                  </li>
                </ul>
              </nav>
            </aside>
          </section>
        </section>
        <section class=tasks-and-pins>

        </section>
        <section class=status-and-infos>
          <div class=battery>

          </div>
          <div class=internet-connection>

          </div>
          <div class=sound>
          
          </div>
          <div class=language>

          </div>
          <div class=date-and-time>
            <time datetime=${state.now.datetime}>${state.now.time}</time>
            <time datetime=${state.now.datetime}>${state.now.date}</time>
          </div>
          <div class=notifications>
            <button>&#x2709;</button>
          </div>
        </section>
      </nav>
      <form hidden id=gateway method=POST action=/files enctype="multipart/form-data" target=response_view>
        <input name=package required type=file webkitdirectory multiple accept=*>
      </form>
      <iframe id=response name=response_view></iframe>
    </body>
  `;
}

function FileView({name, type}) {
  if ( type == 'file' ) {
    return `
      <article class=file tabindex=0>
        ${name.endsWith('jpg') ? `<img src=about:blank>` : ``}
        ${name}
      </article>
    `
  } else if ( type == 'dir' ) {
    return `
      <article class=file tabindex=0>
        &#x1f4c1;
        ${name}
      </article>
    `
  }
}

// file upload
  async function acquireFile(drop) {
    console.log('Something dropped');

    // Prdropent default behavior (Prdropent file from being opened)
    drop.preventDefault();
    drop.stopPropagation();

    let attacher;

    console.log(drop);
    if (drop.dataTransfer.items) {
      attacher = new FormData(gateway);
      // Use DataTransferItemList interface to access the file(s)
      for (const item of drop.dataTransfer.items) {
        const entry = item.webkitGetAsEntry();
        if ( entry.isFile ) {
          const file = item.getAsFile();
          const {name,webkitRelativePath} = file;
          console.log({name,webkitRelativePath,file,item});
          attacher.append('package', file, webkitRelativePath || name);
        } else if ( entry.isDirectory ) {
          await recursivelyAppend(attacher, 'package', entry); 
          console.log([...attacher.values()]); 
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (const file of drop.dataTransfer.files) {
        const {name,webkitRelativePath} = file;
        console.log({name,webkitRelativePath});
      }
      gateway.package.files = drop.dataTransfer.files;
    } 

    if ( gateway.package.files.length ) {
      gateway.submit();
      console.log('File(s) dropped');
      gateway.reset();
    } else if ( attacher ) {
      fetch(gateway.action, {
        method: gateway.method,
        body: attacher,
      }).then(resp => resp.text()).then(text => response.contentDocument.documentElement.replaceWith(toDOM(text).documentElement))
        .then(() => listFiles(''));
      console.log('File(s) dropped');
    }
  }

  async function recursivelyAppend(attacher, prop, directoryEntry) {
    let resolve;
    const p = new Promise(res => resolve = res);
    directoryEntry.createReader().readEntries(async results => {
      for( const result of results ) {
        const path = result.fullPath;
        if ( result.isFile ) {
          await new Promise(res => result.file(file => {
            console.log({file}, path);
            attacher.append(prop, file, path);
            res(); 
          }));
        } else if ( result.isDirectory ) {
          console.log({result});
          await recursivelyAppend(attacher, prop, result);
        }
      }
      resolve();
    });
    return p;
  }

  function modifyDrag(dragover) {
    dragover.preventDefault();
    dragover.stopPropagation();
  }

// file thumbnail show
  async function listFiles(path) {
    const {files,err} = await fetch(`/files/${path}`).then(r => r.json());
    if ( err ) {
      console.warn(err);
      throw new Error(JSON.stringify({message:'An error occurred', error:err}));
    } else {
      const stateChange = {
        [path]: files
      };
      renderFiles(stateChange);
    }
  }
