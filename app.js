import {update, merge, toDOM} from './web_modules/bulgogi.js';

const State = {};

const render = newFlatState => (merge(State, newFlatState), update(App, newFlatState, {useBody:true}));

start();

function start() {
  updateTime();
  //setInterval(updateTime, 7500);
  self.acquireFile = acquireFile;
  self.modifyDrag = modifyDrag;
}

function updateTime() {
  const now = new Date;
  const datetime = now.toISOString();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

  render({
    now: { datetime, date, time }
  });
}

function App(state) {
  return `
    <body>
      <main class=desktop ondrop="acquireFile(event);" ondragover="modifyDrag(event);">
        <article class="file folder" tabindex=0>
          Trash
        </article>
        <article class=file tabindex=0>
          File.Txt
        </article>

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
      <form hidden id=gateway method=POST action=/files enctype=multipart/form-data target=response_view>
        <input name=package required type=file multiple accept=*>
      </form>
      <iframe id=response name=response_view></iframe>
    </body>
  `;
}

function acquireFile(drop) {
	console.log('Something dropped');

	// Prdropent default behavior (Prdropent file from being opened)
	drop.preventDefault();
  drop.stopPropagation();

  let attacher;

	if (drop.dataTransfer.items) {
    attacher = new FormData(gateway);
		// Use DataTransferItemList interface to access the file(s)
		for (var i = 0; i < drop.dataTransfer.items.length; i++) {
			// If dropped items aren't files, reject them
			if (drop.dataTransfer.items[i].kind === 'file') {
				var file = drop.dataTransfer.items[i].getAsFile();
        attacher.append('package', file, file.name);
				console.log('1... file[' + i + '].name = ' + file.name);
			}
		}
	} else {
		// Use DataTransfer interface to access the file(s)
		for (var i = 0; i < drop.dataTransfer.files.length; i++) {
			console.log('2... file[' + i + '].name = ' + drop.dataTransfer.files[i].name);
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
      headers: {
        'Content-type': 'multipart/form'
      }
    }).then(resp => resp.text()).then(text => response.contentDocument.documentElement.replaceWith(toDOM(text)));
    console.log('File(s) dropped');
  }
}

function modifyDrag(dragover) {
	dragover.preventDefault();
  dragover.stopPropagation();
}
