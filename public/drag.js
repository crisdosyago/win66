  export function installDragMove() {
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
      const dragMove = createMover(el);
      dragMove.next();
      el.addEventListener('pointerdown', e => dragMove.next(e));
      el.addEventListener('pointermove', e => dragMove.next(e));
      el.addEventListener('pointerup', e => dragMove.next(e));
    }
  }

  function *createMover(el) {
    waiting: while(true) {
      const {type, clientX, clientY} = yield;
      const {left, top} = el.getBoundingClientRect();
      const attachX = clientX - left;
      const attachY = clientY - top;

      if ( type == 'pointerdown' ) {
        dragging: while(true) {
          const {type,clientX,clientY} = yield; 
          if ( type == 'pointermove' ) {
            updateEl(el,{attachX,attachY,clientX,clientY});
          } else if ( type == 'pointerup' ) {
            break dragging;
          } else if ( type == 'pointerdown' ) {
            continue dragging;
          }
        }
      }
    }
  }

  function updateEl(el, pointer) {
    el.style.left = pointer.clientX - pointer.attachX;
    el.style.top = pointer.clientY - pointer.attachY;
  }
