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

/* With abstract factory */
interface Button { render(): void }
interface Dialog { render(): void }

class LightButton implements Button {
    render(): void {
        console.log("Rendering light button")
    }
}

class DarkButton implements Button {
    render(): void {
        console.log("Rendering dark button")
    }
}

class LightDialog implements Dialog {
    render(): void {
        console.log("Rendering light dialog")
    }
}

class DarkDialog implements Dialog {
    render(): void {
        console.log("Rendering dark dialog")
    }
}

interface UIFactory {
    createButton(): Button;
    createDialog(): Dialog;
}

class LightThemeFactory implements UIFactory {
    createButton(): Button {
        return new LightButton();
    }

    createDialog(): Dialog {
        return new LightDialog();
    }
}

class DarkThemeFactory implements UIFactory {
    createButton(): DarkButton {
        return new DarkButton();
    }

    createDialog(): DarkDialog {
        return new DarkDialog();
    }
}

function renderScreen(factory: UIFactory): void {
    const button = factory.createButton();
    const dialog = factory.createDialog();

    button.render();
    dialog.render();
}

renderScreen(new DarkThemeFactory())