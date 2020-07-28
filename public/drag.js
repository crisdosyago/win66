  const SCROLLBAR_WIDTH = 16;
  const SCROLLBAR_HEIGHT = 16;
  let globalZIndex = 100;

  export function installDragMove(state) {
    // we use pointer events
    // now supported everywhere
    // basic idea
    // pointer down, enter the coroutine
    // pointer move, loop the coroutine
    // pointer up, leave the coroutine
    // things to note: attachment point should be consistent
    // anything with a draggable attribute
    const target = document.querySelectorAll('[dragmove]');
    for( const el of target ) {
      const dragMove = createMover(el, state);
      el.dragMove = dragMove;
      dragMove.next();
      el.addEventListener('pointerdown', e => dragMove.next(e));
      el.addEventListener('pointermove', e => dragMove.next(e));
      el.addEventListener('pointerup', e => dragMove.next(e));
    }

    const notifier = notifyMove();
    notifier.next();

    return event => notifier.next(event);

    function *notifyMove() {
      let lastMover;

      while(true) {
        const event = yield;
        if ( event.type == 'pointermove' ) {
          const mover = event.target.closest('[dragmove]');
          if ( lastMover != mover ) {
            if ( lastMover ) {
              lastMover.dragMove.next({type:'break'});
            }
          }
          lastMover = mover;
        }
      }
    }
  }

  function *createMover(el, state) {
    waiting: while(true) {
      const {type, clientX, clientY, target} = yield;

      if ( type == 'break' ) continue;

      if ( target.matches('button') ) continue;

      const {left,width, height, top} = el.getBoundingClientRect();
      const attachX = clientX - left;
      const attachY = clientY - top;

      if ( type == 'pointerdown' ) {
        el.style.zIndex = globalZIndex++;
        if ( 
          (width - attachX) < SCROLLBAR_WIDTH &&
          (height - attachY) < SCROLLBAR_HEIGHT 
        ) continue waiting;     //because someone is pointing at the resize-drag region

        dragging: while(true) {
          const {type,clientX,clientY} = yield; 
          if ( type == 'pointermove' ) {
            updateEl(el,{attachX,attachY,clientX,clientY}, state);
          } else if ( type == 'pointerup' || type == 'break' ) {
            break dragging;
          } else if ( type == 'pointerdown' ) {
            continue dragging;
          }
        }
      }
    }
  }

  function updateEl(el, pointer, state) {
    el.style.left = `calc(${pointer.clientX - pointer.attachX}px - 1rem)`;
    el.style.top = `calc(${pointer.clientY - pointer.attachY}px - 1rem)`;

    const id = el.dataset.id;
    state.viewState.file[id].x = el.style.left;
    state.viewState.file[id].y = el.style.top;

  }
