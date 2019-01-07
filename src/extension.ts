import * as vscode from "vscode";
import { EmacsEmulator } from "./emulator";
import { EmacsEmulatorMap } from "./emulator-map";
import { cursorMoves } from "./operations";

export function activate(context: vscode.ExtensionContext) {
    const emulatorMap = new EmacsEmulatorMap();
    context.subscriptions.push(emulatorMap);

    function getAndUpdateEmulator() {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (typeof activeTextEditor === "undefined") { return undefined; }

        const [curEmulator, isNew] = emulatorMap.getOrCreate(activeTextEditor);
        if (isNew) {
            context.subscriptions.push(curEmulator);
        }

        return curEmulator;
    }

    vscode.workspace.onDidCloseTextDocument(() => {
        const documents = vscode.workspace.textDocuments;

        // Delete emulators once all tabs of this document have been closed
        for (const key of emulatorMap.getKeys()) {
            const emulator = emulatorMap.get(key);
            if (emulator === undefined ||
                emulator.getTextEditor() === undefined ||
                documents.indexOf(emulator.getTextEditor().document) === -1) {
                    emulatorMap.delete(key);
                }
        }
    });

    function registerEmulatorCommand(
        commandName: string,
        callback: (emulator: EmacsEmulator, ...args: any[]) => any,
    ) {
        const disposable = vscode.commands.registerCommand(commandName, () => {
            const emulator = getAndUpdateEmulator();
            if (!emulator) {
                return;
            }

            callback(emulator);
        });
        context.subscriptions.push(disposable);
    }

    cursorMoves.forEach((commandName) => {
        registerEmulatorCommand(`emacs-mcx.${commandName}`, (emulator) => {
            emulator.cursorMove(commandName);
        });
    });

    registerEmulatorCommand("emacs-mcx.killLine", (emulator) => {
        emulator.killLine();
    });

    registerEmulatorCommand("emacs-mcx.killWholeLine", (emulator) => {
        emulator.killWholeLine();
    });

    registerEmulatorCommand("emacs-mcx.killRegion", (emulator) => {
        emulator.killRegion();
    });

    registerEmulatorCommand("emacs-mcx.copyRegion", (emulator) => {
        emulator.copyRegion();
    });

    registerEmulatorCommand("emacs-mcx.yank", (emulator) => {
        emulator.yank();
    });

    registerEmulatorCommand("emacs-mcx.enterMarkMode", (emulator) => {
        emulator.enterMarkMode();
    });

    registerEmulatorCommand("emacs-mcx.cancel", (emulator) => {
        emulator.cancel();
    });

    registerEmulatorCommand("emacs-mcx.deleteRight", (emulator) => {
        emulator.deleteRight();
    });

    registerEmulatorCommand("emacs-mcx.deleteLeft", (emulator) => {
        emulator.deleteLeft();
    });

    registerEmulatorCommand("emacs-mcx.newLine", (emulator) => {
        emulator.newLine();
    });

    // TODO: Implement these commands
    [
        "emacs-mcx.deleteBlankLines",
        "emacs-mcx.scrollLineToCenterTopBottom",
    ].forEach((commandName) => {
        registerEmulatorCommand(commandName, (emulator) => {
            vscode.window.showInformationMessage(`Sorry, ${commandName} is not implemented yet.`);
        });
    });
}

// this method is called when your extension is deactivated
export function deactivate() {}
