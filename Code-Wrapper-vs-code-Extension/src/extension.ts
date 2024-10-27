import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "html-wrapper-" is now active!');

    // Registering the command for wrapping HTML elements
    let disposable = vscode.commands.registerTextEditorCommand('html-wrapper.wrapper', async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
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

            // Adding the option to provide attributes
            const attributeInput = await vscode.window.showInputBox({
                placeHolder: 'Add attributes (e.g., id="wrapper" class="myClass") or leave empty',
                prompt: 'Enter attributes to be added to the tag'
            });

            console.log(`Selected tag: ${tag}`);

            // Handle multiple selections (support for multiple HTML elements wrapping)
            const selections = textEditor.selections;

            selections.forEach(selection => {
                const contentToWrap = textEditor.document.getText(selection);
                const wrappedText = `<${tag} ${attributeInput || ''}>\n${contentToWrap}\n</${tag}>`;

                // Replace the selected HTML content with the wrapped text
                textEditor.edit(editBuilder => {
                    editBuilder.replace(selection, wrappedText);
                }).then(success => {
                    if (success) {
                        vscode.window.showInformationMessage(`HTML element(s) wrapped in <${tag}> successfully!`);
                    } else {
                        vscode.window.showInformationMessage('Failed to replace text. Try again.');
                    }
                }, error => {
                    vscode.window.showErrorMessage('An error occurred while replacing text.');
                    console.error('Error occurred while executing command:', error);
                });
            });
        } catch (error) {
            console.error('Error occurred while executing command:', error);
            vscode.window.showErrorMessage('An error occurred while executing the command.');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
