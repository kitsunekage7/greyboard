import { Application } from "./core.js";
import Viewport from "./viewport.js";
import { Board } from "./board.js";
import { Toolbox } from "./tool.js";
import { Socket } from "./socket.js";
import { ActionStack } from "./action.js";
import Exporter from "./exporter.js";
export let app = new Application();
export let viewport = new Viewport();
export let board = new Board();
export let toolbox = new Toolbox();
let bid = window.location.pathname.substr(window.location.pathname.length - 16, 16);
export let socket = new Socket(bid);
app.onmousedown.add(() => {
    if (app.mouse.button == 0)
        toolbox.selected.onClickDown();
});
app.onmousemove.add(() => {
    if (app.mouse.pressed) {
        if (app.mouse.button == 0)
            toolbox.selected.onClickMove();
        else if (app.mouse.button == 1)
            viewport.pan(app.mouse.x - app.mouse.px, app.mouse.y - app.mouse.py);
    }
});
app.onmouseup.add(() => {
    toolbox.selected.onClickUp();
});
app.onmousewheel.add((dx, dy) => {
    viewport.zoom(app.mouse.x, app.mouse.y, dy * 0.03);
});
app.onupdate.add((ts) => {
    app.graphics.clear("#222222");
    app.graphics.setView(viewport.position, viewport.scale);
    board.draw();
    toolbox.selected.onFrameUpdate();
    toolbox.selected.onDraw();
    app.graphics.fill("#fc8210");
    app.graphics.font("Arial", 14 / viewport.scale, "left", "middle");
    let percent = ((new Date()).getTime() - socket.lastHeathBeatTime) / 200;
    for (let cid in socket.clientCoords) {
        if (cid == socket.cid)
            continue;
        socket.clientCoords[cid].interpolate(percent);
        app.graphics.img(socket.clientCoords[cid].x, socket.clientCoords[cid].y, 16 / viewport.scale, 16 / viewport.scale, "/images/cursor.png");
        if (socket.clients[cid])
            app.graphics.text(socket.clientCoords[cid].x + 24 / viewport.scale, socket.clientCoords[cid].y + 8 / viewport.scale, socket.clients[cid].name);
    }
});
app.oncopy.add((data) => {
    toolbox.select.copySelection(data);
});
app.onpaste.add((data) => {
    board.addFromClipboard(data);
});
app.ui.onaction.add((action, e) => {
    switch (action) {
        case "save":
            window.open(`/b/${socket.bid}/save`);
            break;
        case "export":
            Exporter.exportAsPNG();
            break;
        case "clear":
            board.items = {};
            socket.send("board:clear", null);
            break;
        case "undo":
            ActionStack.undo();
            break;
        case "redo":
            ActionStack.redo();
            break;
        case "tool-select":
            toolbox.selectTool(toolbox.select);
            break;
        case "tool-pencil":
            toolbox.selectTool(toolbox.pencil);
            break;
        case "tool-eraser":
            toolbox.selectTool(toolbox.eraser);
            break;
        case "tool-rectangle":
            toolbox.selectTool(toolbox.rectange);
            break;
        case "tool-fillrectangle":
            toolbox.selectTool(toolbox.fillrectangle);
            break;
        case "tool-ellipse":
            toolbox.selectTool(toolbox.ellipse);
            break;
        case "tool-fillellipse":
            toolbox.selectTool(toolbox.fillellipse);
            break;
        case "tool-line":
            toolbox.selectTool(toolbox.line);
            break;
        case "tool-arrow":
            toolbox.selectTool(toolbox.arrow);
            break;
        case "zoomin":
            viewport.zoom(app.width / 2, app.height / 2, -0.5);
            break;
        case "zoomout":
            viewport.zoom(app.width / 2, app.height / 2, 0.5);
            break;
        case "set-color":
            let color = $(e).attr("color");
            if (color)
                toolbox.selectColor(color);
            break;
        case "pan-to-user":
            let cid = e.getAttribute("data-user");
            if (cid && cid != socket.cid) {
                viewport.panTo(socket.clientCoords[cid].x, socket.clientCoords[cid].y);
            }
            break;
    }
});
app.registerShortcut(90, true, false, false, () => { ActionStack.undo(); });
app.registerShortcut(90, true, true, false, () => { ActionStack.redo(); });
app.registerShortcut(46, false, false, false, () => { toolbox.select.deleteSelection(); });
app.registerShortcut(83, false, false, false, () => { toolbox.selectTool(toolbox.select); });
app.registerShortcut(66, false, false, false, () => { toolbox.selectTool(toolbox.pencil); });
app.registerShortcut(69, false, false, false, () => { toolbox.selectTool(toolbox.eraser); });
app.registerShortcut(76, false, false, false, () => { toolbox.selectTool(toolbox.line); });
app.registerShortcut(82, false, false, false, () => { toolbox.selectTool(toolbox.rectange); });
app.registerShortcut(82, false, true, false, () => { toolbox.selectTool(toolbox.fillrectangle); });
app.registerShortcut(67, false, false, false, () => { toolbox.selectTool(toolbox.ellipse); });
app.registerShortcut(67, false, true, false, () => { toolbox.selectTool(toolbox.fillellipse); });
app.registerShortcut(65, false, false, false, () => { toolbox.selectTool(toolbox.arrow); });
ActionStack.onundo.add(() => {
    toolbox.select.clearSelection();
});
ActionStack.onredo.add(() => {
    toolbox.select.clearSelection();
});
