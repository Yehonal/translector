import path from 'path'
import electron, { ipcMain as ipc, app, BrowserWindow } from 'electron';
import windowStateKeeper from 'electron-window-state';
import settings from "electron-settings";

const rootPath = path.resolve(path.join(__dirname, "/../../"));
const icon = path.join(rootPath, "public/android-chrome-512x512.png");

class Service {
    constructor({
        prefix,
        name,
        query,
        langs,
        srcLang,
        dstLang,
        enabled,
    }) {
        this.prefix = prefix;
        /** @type {string} */
        this.name = name;
        /** @type {BrowserWindow} */
        this.handler = null;
        this.query = query;
        this.langs = langs;
        this.srcLang = srcLang;
        this.dstLang = dstLang;
        this.text = "";
        this.enabled = enabled;
    }

    disable() {
        this.enabled = false;
        this.handler.hide()
    }

    enable() {
        this.enabled = true;
        this.handler.show();
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
            let url = this.getUrl(this.text);
            this.handler.loadURL(url);
        }
    }

    findText(text, reverse = false) {
        if (!this.enabled) return;
        this.handler.loadURL(this.getUrl(text, reverse));
    }

    getUrl(text, reverse = false) {
        this.text = text;

        return this.prefix + this.query(!reverse ? this.srcLang : this.dstLang, !reverse ? this.dstLang : this.srcLang, text);
    }
}

const TYPES = {
    GOOGLE: new Service({
        name: "google",
        prefix: "https://translate.google.it/?",
        query: (src, dst, text) => `sl=${src}&tl=${dst}&text=${text}`,
        srcLang: "it",
        dstLang: "en",
        langs: {
            en: "en",
            it: "it",
            es: "es"
        }
    }),
    DEEPL: new Service({
        name: "deepl",
        prefix: "https://www.deepl.com/translator#",
        query: (src, dst, text) => `${src}/${dst}/${text}`,
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
        query: (src, dst, text) => `${src}${dst}/${text}`,
        srcLang: "it",
        dstLang: "en",
        langs: {
            en: "en",
            it: "it",
            es: "es"
        }
    }),
    TLDICTIONARY: new Service({
        name: "tldictionary",
        prefix: "file://" + path.join(rootPath, "build/index.html") + "#/dictionaryGet?",
        query: (src, dst, text) => `filter={"_lang":["${src}_${dst}","${dst}_${src}"],"q":"${text}"}`,
        srcLang: "it",
        dstLang: "en",
        langs: {
            en: "en",
            it: "it",
            es: "es"
        }
    })
}

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
        'width': 640,
        'height': 480,
        //resizable: false,
        webPreferences: {
            nodeIntegration: true
        },
        icon
    });

    mainWindow.setAlwaysOnTop(true, 'screen');

    //mainWindow.webContents.openDevTools();

    mainWindow.loadURL("file://" + path.join(rootPath, "public/toolbar.html"))

    mainWindow.setMenu(null);

    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    mainWindowState.manage(mainWindow);

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        app.quit()
    })

    return mainWindow;
}

/**
 * 
 * @param {Electron.BrowserWindow} handler 
 * @param {Service} type 
 */
function createTWindow(parent, type) {
    // Load the previous state with fallback to defaults
    let mainWindowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 600,
        file: type.name + ".json",
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Create the browser window.
    type.handler = new BrowserWindow({
        //alwaysOnTop: true,
        'x': mainWindowState.x,
        'y': mainWindowState.y,
        'width': mainWindowState.width,
        'height': mainWindowState.height,
        parent,
        icon
    });

    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    mainWindowState.manage(type.handler);

    //console.log(type.prefix)
    const curLangs = settings.get("currentLangs") || { src : "en" , dst : "es"}
    type.setLang(curLangs.src, curLangs.dst, true)

    const enabledServices = settings.get("enabledServices") || {};
    const isEnabled = enabledServices ? enabledServices[type.name.toUpperCase()] : true

    type[isEnabled ? "enable" : "disable"]()


    //type.handler.setMenu(null);

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
    TYPES.DEEPL.setLang(src, dst, true)
    TYPES.WORDREF.setLang(src, dst, true)
    TYPES.TLDICTIONARY.setLang(src, dst, true)
})

ipc.on('setService', (event, message) => {
    var opt = JSON.parse(message);
    let id = opt.id;
    let enabled = opt.enabled;

    TYPES[id][enabled ? "enable" : "disable"]();
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', () => {
    var main = createMainWindow("main")
    createTWindow(null, TYPES.GOOGLE)
    createTWindow(null, TYPES.WORDREF)
    createTWindow(null, TYPES.DEEPL)
    createTWindow(null, TYPES.TLDICTIONARY)

    electron.globalShortcut.register('CommandOrControl+T', () => {
        let currentClipboard = electron.clipboard.readText();
        TYPES.GOOGLE.findText(currentClipboard);
        TYPES.DEEPL.findText(currentClipboard);
        TYPES.WORDREF.findText(currentClipboard);
        TYPES.TLDICTIONARY.findText(currentClipboard);
    })

    electron.globalShortcut.register('CommandOrControl+R', () => {
        let currentClipboard = electron.clipboard.readText();
        TYPES.GOOGLE.findText(currentClipboard, true);
        TYPES.DEEPL.findText(currentClipboard, true);
        TYPES.WORDREF.findText(currentClipboard, true);
        TYPES.TLDICTIONARY.findText(currentClipboard, true);
    })
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
