"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log('Congratulations, your extension "html-wrapper-" is now active!');
    let disposable = vscode.commands.registerTextEditorCommand('html-wrapper.wrapper', async (textEditor, edit) => {
        try {
            // Show Quick Pick to select a tag
            const tags = [
                'div', 'section', 'article', 'header', 'footer', 'main', 'nav', 'aside', 'form', 'table',
                'blockquote', 'ul', 'ol', 'span', 'a', 'strong', 'em', 'code', 'mark'
            ];
            const tag = await vscode.window.showQuickPick(tags, {
                placeHolder: 'Select the HTML tag to wrap with'
            });
            if (!tag) {
                vscode.window.showInformationMessage('No tag selected. Aborting wrap operation.');
                return;
            }
            console.log(`Selected tag: ${tag}`);
            // Prompt for optional class
            const classInput = await vscode.window.showInputBox({
                prompt: 'Enter an optional class for the tag',
                placeHolder: 'Enter class name (optional)'
            });
            // Prompt for optional id
            const idInput = await vscode.window.showInputBox({
                prompt: 'Enter an optional ID for the tag',
                placeHolder: 'Enter ID (optional)'
            });
            const selection = textEditor.selection;
            const startPosition = selection.start;
            const openingTag = findOpeningTag(textEditor.document, startPosition);
            if (!openingTag) {
                vscode.window.showInformationMessage('Failed to find matching opening tag.');
                return;
            }
            console.log(`Opening tag found: ${textEditor.document.getText(openingTag)}`);
            const closingTag = findClosingTag(textEditor.document, openingTag);
            if (!closingTag) {
                vscode.window.showInformationMessage('Failed to find matching closing tag.');
                return;
            }
            console.log(`Closing tag found: ${textEditor.document.getText(closingTag)}`);
            // Wrap the entire HTML element with the specified tag and optional class/id
            const contentToWrap = textEditor.document.getText(new vscode.Range(openingTag.start, closingTag.end));
            let wrappedText = `<${tag}`;
            if (classInput) {
                wrappedText += ` class="${classInput}"`;
            }
            if (idInput) {
                wrappedText += ` id="${idInput}"`;
            }
            wrappedText += `>\n${contentToWrap}\n</${tag}>`;
            // Replace the selected HTML content with the wrapped text
            textEditor.edit(editBuilder => {
                editBuilder.replace(new vscode.Range(openingTag.start, closingTag.end), wrappedText);
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage(`HTML element wrapped in <${tag}> successfully!`);
                }
                else {
                    vscode.window.showInformationMessage('Failed to replace text. Try again.');
                }
            }, error => {
                vscode.window.showErrorMessage('An error occurred while replacing text.');
                console.error('Error occurred while executing command:', error);
            });
        }
        catch (error) {
            console.error('Error occurred while executing command:', error);
            vscode.window.showErrorMessage('An error occurred while executing the command.');
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
function findOpeningTag(document, position) {
    const openingTagRegex = /<\w+/g;
    let lineNumber = position.line;
    while (lineNumber >= 0) {
        const lineText = document.lineAt(lineNumber).text;
        const matches = [...lineText.matchAll(openingTagRegex)];
        const tagMatch = matches.find(match => position.character >= match.index && position.character <= match.index + match[0].length);
        if (tagMatch) {
            const startCharacter = tagMatch.index;
            return new vscode.Range(new vscode.Position(lineNumber, startCharacter), new vscode.Position(lineNumber, startCharacter + tagMatch[0].length));
        }
        lineNumber--;
    }
    return undefined;
}
function findClosingTag(document, openingTagRange) {
    const openingTagText = document.getText(openingTagRange);
    const openingTagName = openingTagText.match(/<(\w+)/)?.[1];
    if (openingTagName) {
        const closingTagPattern = `</${openingTagName}>`;
        const closingTagRegex = new RegExp(closingTagPattern, 'i');
        let lineNumber = openingTagRange.start.line;
        while (lineNumber < document.lineCount) {
            const lineText = document.lineAt(lineNumber).text;
            const match = lineText.match(closingTagRegex);
            if (match) {
                const startCharacter = lineText.indexOf(match[0]);
                return new vscode.Range(new vscode.Position(lineNumber, startCharacter), new vscode.Position(lineNumber, startCharacter + match[0].length));
            }
            lineNumber++;
        }
    }
    return undefined;
}
//# sourceMappingURL=extension.js.map