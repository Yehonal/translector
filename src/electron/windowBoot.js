import path from 'path'
import electron from 'electron';
import windowStateKeeper from 'electron-window-state';
import {
    text
} from '@fortawesome/fontawesome-svg-core';

const ipc = electron.ipcMain;
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

class Service {
    constructor({
        prefix,
        name,
        langFormat,
        query,
        langs,
        srcLang,
        dstLang
    }) {
        this.prefix = prefix;
        this.name = name;
        this.handler = null;
        this.langFormat = langFormat;
        this.query = query;
        this.langs = langs;
        this.srcLang = srcLang;
        this.dstLang = dstLang;
        this.text = "";
    }

    setHandler(handler) {
        this.handler = handler;
    }

    setLang(source, dest, reload = false) {
        if (source)
            this.srcLang = this.langs[source];
        if (dest)
            this.dstLang = this.langs[dest];

        if (reload) {
            this.handler.loadURL(this.getUrl(this.text));
        }
    }

    getUrl(text) {
        this.text = text;

        return this.prefix + this.langFormat(this.srcLang, this.dstLang) + this.query + text;
    }
}

const TYPES = {
    GOOGLE: new Service({
        name: "google",
        prefix: "https://translate.google.it/?",
        langFormat: (src, dst) => `sl=${src}&tl=${dst}`,
        query: "&text=",
        srcLang: "it",
        dstLang: "en",
        langs: {
            en: "en",
            it: "it",
            es: "es"
        }
    }),
    WORDREF: new Service({
        name: "wordref",
        prefix: "https://www.wordreference.com/",
        langFormat: (src, dst) => `${src}${dst}`,
        query: "/",
        srcLang: "it",
        dstLang: "en",
        langs: {
            en: "en",
            it: "it",
            es: "es"
        }
    }),
}

const rootPath = path.resolve(path.join(__dirname, "/../../"));
const icon = path.join(rootPath, "public/android-chrome-512x512.png");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
function createMainWindow(name) {
    // Load the previous state with fallback to defaults
    let mainWindowState = windowStateKeeper({
        file: name + ".json",
    });

    // Create the window using the state information
    var mainWindow = new BrowserWindow({
        'x': mainWindowState.x,
        'y': mainWindowState.y,
        'width': 400,
        'height': 150,
        resizable: false,
        icon
    });

    mainWindow.loadURL("file://" + path.join(rootPath, "public/toolbar.html"))

    mainWindow.setMenu(null);

    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    mainWindowState.manage(mainWindow);

    return mainWindow;
}

/**
 * 
 * @param {Electron.BrowserWindow} handler 
 * @param {Service} type 
 */
function createTWindow(main, type) {
    // Load the previous state with fallback to defaults
    let mainWindowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 600,
        file: type.name + ".json",
    });

    // Create the browser window.
    type.handler = new BrowserWindow({
        alwaysOnTop: true,
        'x': mainWindowState.x,
        'y': mainWindowState.y,
        'width': mainWindowState.width,
        'height': mainWindowState.height,
        parent: main,
        icon
    });

    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    mainWindowState.manage(type.handler);

    var currentClipboard = electron.clipboard.readText();
    var url = type.getUrl(currentClipboard);
    type.handler.loadURL(type.prefix);

    setInterval(() => {
        let newClipboard = electron.clipboard.readText();
        if (newClipboard !== currentClipboard) {
            currentClipboard = newClipboard;
            url = type.getUrl(currentClipboard);
            type.handler.loadURL(url);
        }
    }, 200);

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    type.handler.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        app.quit()
    })
}

ipc.on('setLang', (event, message) => {
    var opt = JSON.parse(message);
    let src, dst;

    switch (opt.type) {
        case "src":
            src = opt.lang;
            break;
        case "dst":
        default:
            dst = opt.lang;
            break;
    }

    TYPES.GOOGLE.setLang(src, dst, true)
    TYPES.WORDREF.setLang(src, dst, true)
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', () => {
    createMainWindow("main")
    createTWindow(null, TYPES.GOOGLE)
    createTWindow(null, TYPES.WORDREF)
});


// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

/*
app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});*/

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
