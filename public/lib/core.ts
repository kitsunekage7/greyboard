import Delegate from "./delegate.js"
import Graphics from "./graphics.js";
import { UI } from "./ui.js";

export class Mouse {
    x : number = 0;
    y : number = 0;
    px : number = 0;
    py : number = 0;
    dx : number = 0;
    dy : number = 0;
    button : number = -1;
    pressed : boolean = false;
}

export class Keyboard {
    key : number = 0;
    ctrl : boolean = false;
    shift : boolean = false;
    alt : boolean = false;
    pressed : boolean = false;
}

export interface Shortcut{
    key : number;
    ctrl : boolean;
    shift : boolean;
    alt : boolean;
    callback : (...args : any[]) => void;
}

export class Application {
    graphics : Graphics;

    width: number = 0;
    height: number = 0;
    mouse = new Mouse();
    keyboard = new Keyboard();
    shortcuts : Array<Shortcut> = [];
    focused : boolean = true;

    onresize = new Delegate();
    onmousedown = new Delegate();
    onmousemove = new Delegate();
    onmouseup = new Delegate();
    onmousewheel = new Delegate();
    onkeydown = new Delegate();
    onkeyup = new Delegate();

    oncopy = new Delegate();
    onpaste = new Delegate();

    onupdate = new Delegate();
    lastUpdateTime : number;

    ui = new UI();

    constructor(){
        let canvas = document.getElementById("canvas");
        this.graphics = new Graphics(canvas as HTMLCanvasElement);
        //@ts-ignore
        createjs.Ticker.timingMode = createjs.Ticker.RAF;

        this.resize(window.innerWidth, window.innerHeight);

        window.addEventListener("resize", () => {
            this.resize(window.innerWidth, window.innerHeight);

            this.onresize.invoke(this.width, this.height);
        });
        window.addEventListener("keydown", (e) => {
            this.keyboard.key = e.keyCode;
            this.keyboard.pressed = true;
            this.keyboard.ctrl = e.ctrlKey;
            this.keyboard.shift = e.shiftKey;
            this.keyboard.alt = e.altKey;
            this.onkeydown.invoke(e.keyCode, e.ctrlKey, e.shiftKey, e.altKey);
        });
        window.addEventListener("keyup", (e) => {
            console.log(e);
            for(let shortcut of this.shortcuts)
                if(e.ctrlKey == shortcut.ctrl && e.shiftKey == shortcut.shift && e.altKey == shortcut.alt && e.keyCode == shortcut.key)
                    shortcut.callback();
                
            this.keyboard = new Keyboard();
            this.onkeyup.invoke(e.keyCode, e.ctrlKey, e.shiftKey, e.altKey);
        });
        window.addEventListener("copy", (e) => {
            this.oncopy.invoke((e as ClipboardEvent).clipboardData);
        });
        window.addEventListener("paste", (e) => {
            this.onpaste.invoke((e as ClipboardEvent).clipboardData);
        });
        window.addEventListener("focus", (e) => {
            this.focused = true;
        });
        window.addEventListener("blur", (e) => {
            this.focused = false;
        });

        this.graphics.canvas.addEventListener("mousedown", (e) => {
            this.mouse.dx = e.clientX;
            this.mouse.dy = e.clientY;
            this.mouse.button = e.button;
            this.mouse.pressed = true;
            this.onmousedown.invoke(e.button, e.clientX, e.clientY);
        });
        this.graphics.canvas.addEventListener("mousemove", (e) => {
            this.mouse.px = this.mouse.x;
            this.mouse.py = this.mouse.y;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.onmousemove.invoke(e.clientX, e.clientY);
        });
        this.graphics.canvas.addEventListener("mouseup", (e) => {
            this.mouse.pressed = false;
            this.mouse.button = -1;
            this.onmouseup.invoke(e.clientX, e.clientY);
        });
        this.graphics.canvas.addEventListener("wheel", (e) => {
            this.onmousewheel.invoke(e.deltaX, e.deltaY);
        });

        this.lastUpdateTime = (new Date()).getTime();
        this.update();
    }

    resize(w : number, h : number) {
        this.width = w;
        this.height = h;
        this.graphics.resize(w, h);
    }

    update(){
        window.requestAnimationFrame(() => {
            let now = (new Date()).getTime();
            let ts = (now - this.lastUpdateTime) / 1000;
            this.lastUpdateTime = now;
            this.onupdate.invoke(ts);
            this.update();
        });
    }

    registerShortcut(key : number, ctrl : boolean, shift : boolean, alt : boolean, callback : (...args : any[]) => void) {
        this.shortcuts.push({key, ctrl, shift, alt, callback});
    }

    setCursor(cursor : string) {
        document.body.style.cursor = cursor;
    }
} 