import {update, merge} from './web_modules/bulgogi.js';

const State = {};

const render = newFlatState => (merge(State, newFlatState), update(App, newFlatState, {useBody:true}));

start();

function start() {
  updateTime();
  //setInterval(updateTime, 7500);
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
      <main class=desktop>
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
    </body>
  `;
}
