var canvas,
    ctx,
    isPainting = false,
    w = 0;
    h = 0;

var colour = "black",
    size = 2;

const setPointerType = (value) => {
  const pt = document.getElementById("pointertype")
  pt.innerText = value
}

const setTouchType = (value) => {
  if (value.touchType) {
    pt.innerText = value.touchType
  }
}

const setPressure = (value) => {
  const b = document.getElementById("bar")
  b.style.height = (value * 100.0) + 'px';
}

const logButtons = (e) => {
  const b = document.getElementById("buttons")

  b.innerText = `${e.button} ${e.buttons}`
}

function down(e) {
  if (e.pointerType) {
    setPointerType(e.pointerType)
  } else {
    setPointerType('----')
  }

  if (e && e.pressure) {
    setPressure(e.pressure)
  }
  isPainting = true;

  logButtons(e)
}

function up(e) {
  isPainting = false;
  ctx.stroke();
  ctx.beginPath();

  if (e && e.pressure) {
    setPressure(e.pressure)
  } else {
    setPressure(0)
  }

  logButtons(e)
}

const ongoingTouches = [];

const keys = {}

const updateKeys = () => {
  const l = document.getElementById("list")

  const nodes = []
  Object.keys(keys).forEach(k => {
    const sl = keys[k]
    if (sl.enabled) {
      const li = document.createElement('li');
      const ins = document.createElement('div');
      ins.setAttribute('class','item');

      const c = sl.ctrl ? ' Ctrl' : ''
      const a = sl.alt ? ' Alt' : ''
      const s = sl.shift ? ' Shift' : ''
      const m = sl.meta ? ' Meta' : ''

      ins.innerHTML = `&lt;${sl.key}&gt; - ${sl.keyCode} - ${sl.code} ${c}${a}${s}${m}`
      li.append(ins)
      nodes.push(li)
    }
  })

  l.replaceChildren(...nodes)
}

const showKey = (e) => {
  keys[e.keyCode] = {
    enabled: true,
    key: e.key,
    keyCode: e.keyCode,
    code: e.code,
    ctrl: e.ctrlKey,
    shift: e.shiftKey,
    meta: e.metaKey,
    alt: e.altKey
  }
  updateKeys()
}

const hideKey = (e) => {
  keys[e.keyCode] = {
    enabled: false,
    key: e.key,
    keyCode: e.keyCode,
    code: e.code,
    ctrl: e.ctrlKey,
    shift: e.shiftKey,
    meta: e.metaKey,
    alt: e.altKey
  }
  updateKeys()
}

function init() {
    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointerout', up)
    canvas.addEventListener('pointermove', draw)

    // disable right click menu
    canvas.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }

    // touch drawing
    canvas.addEventListener("touchstart", handleStart);
    canvas.addEventListener("touchend", handleEnd);
    canvas.addEventListener("touchcancel", handleCancel);
    canvas.addEventListener("touchmove", handleMove);

    const b = document.getElementById("body")
    b.addEventListener("keydown", showKey)
    b.addEventListener("keyup", hideKey)
}

const cols = [ "cyan", "green", "blue", "red", "yellow", "orange", "darkslategray", "black", "erase"]

const removeClasses = (skipthisone) => {
  cols.forEach(c => {
    const e = document.getElementById(c);
    if (e && c !== skipthisone) {
      e.classList.remove("active")
    }
  })
}

function color(obj) {
    obj.classList.add("active");
    removeClasses(obj.id)
    switch (obj.id) {
        case "erase":
            colour = "white";
            break;
        default:
          colour = obj.id
        break;
    }
}

const szs = [ "2", "4", "8", "15", "20", "30" ]

const removeSizeClasses = (skipthisone) => {
  szs.forEach(c => {
    const e = document.getElementById(c);
    if (e && c !== skipthisone) {
      e.classList.remove("active")
    }
  })
}

const setsize = (selected) => {
  size = selected;
  const e = document.getElementById("" + selected)
  e.classList.add("active");
  removeSizeClasses("" + selected)

}

const draw = (e) => {
  if(!isPainting) {
      return;
  }

  ctx.strokeStyle = colour;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';

  if (e.buttons === 32) {
    ctx.strokeStyle = 'white'
  }

  if (e.changedTouches) {
    ctx.lineTo(e.changedTouches[0].pageX - canvas.offsetLeft, e.changedTouches[0].pageY - canvas.offsetTop)
  }
  else {
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop)
  }
  ctx.stroke();

  if (e && e.pressure) {
    setPressure(e.pressure)
  }
}

function erase() {
  ctx.clearRect(0, 0, w, h);
}

function handleStart(evt) {
  evt.preventDefault();
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    ongoingTouches.push(copyTouch(touches[i]));
    ctx.beginPath();
    ctx.arc(touches[i].pageX, touches[i].pageY, size, 0, 2 * Math.PI, false); // a circle at the start
    ctx.fillStyle = colour;
    ctx.fill();

    setPressure(touches[i].force)
  }
}

function handleMove(evt) {
  evt.preventDefault();
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      ctx.beginPath();
      ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
      ctx.lineTo(touches[i].pageX, touches[i].pageY);
      ctx.lineWidth = size;
      ctx.strokeStyle = colour;
      ctx.stroke();

      setPressure(touches[i].force)
      setTouchType(touches[i])

      ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
    } else {
      log("can't figure out which touch to continue");
    }
  }
}

function handleEnd(evt) {
  evt.preventDefault();
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    let idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      ctx.lineWidth = size;
      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
      ctx.lineTo(touches[i].pageX, touches[i].pageY);
      ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8); // and a square at the end
      ongoingTouches.splice(idx, 1); // remove it; we're done
    } else {
      log("can't figure out which touch to end");
    }
  }
}

function handleCancel(evt) {
  evt.preventDefault();
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    let idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(idx, 1); // remove it; we're done
  }
}