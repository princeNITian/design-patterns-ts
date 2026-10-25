"use strict";
/* Without abstract factory

type Theme = "dark" | "light";

class Button {
    constructor(public theme: Theme) {}
}

class Dialog {
    constructor(public theme: Theme) {}
}

function createTheme(theme: Theme) {
    return {
        button: new Button(theme),
        dialog: new Dialog(theme)
    };
}

*/
Object.defineProperty(exports, "__esModule", { value: true });
class LightButton {
    render() {
        console.log("Rendering light button");
    }
}
class DarkButton {
    render() {
        console.log("Rendering dark button");
    }
}
class LightDialog {
    render() {
        console.log("Rendering light dialog");
    }
}
class DarkDialog {
    render() {
        console.log("Rendering dark dialog");
    }
}
class LightThemeFactory {
    createButton() {
        return new LightButton();
    }
    createDialog() {
        return new LightDialog();
    }
}
class DarkThemeFactory {
    createButton() {
        return new DarkButton();
    }
    createDialog() {
        return new DarkDialog();
    }
}
function renderScreen(factory) {
    const button = factory.createButton();
    const dialog = factory.createDialog();
    button.render();
    dialog.render();
}
renderScreen(new DarkThemeFactory());
