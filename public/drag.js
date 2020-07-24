  export function installDragMove() {
    // we use pointer events
    // now supported everywhere
    // basic idea
    // pointer down, enter the coroutine
    // pointer move, loop the coroutine
    // pointer up, leave the coroutine
    // things to note: attachment point should be consistent
    // anything with a draggable attribute
    const target = document.querySelectorAll('[draggable]');
  }
