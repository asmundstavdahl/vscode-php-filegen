// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { readFileSync } from 'fs';
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(
		'php-filegen.generateNamespacedFile',
		generateNamespacedFile(context)
	);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

function generateNamespacedFile(context: vscode.ExtensionContext) {
	return () => {
		const editor = vscode.window.activeTextEditor;
		if (editor === undefined || editor.document.isUntitled) {
			vscode.window.showErrorMessage('No active editor for an on-disk file');
			return;
		}
		const fileHasContent = editor.document.getText().length > 0;
		if (fileHasContent) {
			vscode.window.showErrorMessage('Won\'t manipulate a file with contents');
			return;
		}

		const fileName = editor.document.fileName;

		const projectNamespace = getProjectNamespace();
		const fileNamespace = inferProjectRelativeNamespaceFromFilePath(fileName);
		const className = inferClassNameFromFilePath(fileName);
		const classInterfaceOrTrait =
			className[0] === "i"
				? "interface"
				: (className[0] === "t"
					? "trait"
					: "class");
		const maybeConstructorSnippet =
			classInterfaceOrTrait === "class"
				? `\${50:\${51:public} function __construct(\${55:})
	{
		\${57:}
	\\}
	
	}`
				: '';

		const namespace = projectNamespace?.replace(/\\$/, "") + (fileNamespace ? "\\" : "") + fileNamespace;

		editor.insertSnippet(
			new vscode.SnippetString(
				`<?php

declare(strict_types=1);

namespace ${namespace};

\${05:${classInterfaceOrTrait}} ${className}\${10:}
{
	${maybeConstructorSnippet}\$0
}
`));
	};
}

export function getProjectNamespace() {
	return getProjectNamespaceFromComposerJson(
		readFileSync(getPathToComposerJson()).toString()
	);
}

export function inferClassNameFromFilePath(filePath: string): string {
	let pathComponents = filePath.split("/");
	const fileName = pathComponents.pop();
	const className = fileName?.split(".")[0];

	if (className === undefined) {
		throw new Error(`Could not infer class name from file path '${filePath}'`);
	}

	return className;
}

export function inferProjectRelativeNamespaceFromFilePath(filePath: string): string {
	let namespaceComponents: string[] = [];
	let filePathComponents = filePath.split("/").reverse();

	// Pop the filename (Class.php)
	filePathComponents.shift();

	while (filePathComponents.length > 0 && filePathComponents[0] !== "src") {
		namespaceComponents.unshift(filePathComponents[0]);
		filePathComponents.shift();
	}

	return namespaceComponents.join("\\");
}

function getPathToComposerJson(): string {
	const fromConfig = vscode.workspace
		.getConfiguration('php-filegen')
		.get<string>('composerJsonPath');

	const wsFolders = vscode.workspace.workspaceFolders;
	if (wsFolders === undefined) {
		throw new Error("Can't get path to composer.json if there is no folder open");
	}

	const workDir = wsFolders[0].uri.path;

	return workDir + "/" + (fromConfig ?? "/composer.json");
}

export function getProjectNamespaceFromComposerJson(composerJsonContent: string): string | undefined {
	const json = JSON.parse(composerJsonContent);
	const autoload = json.autoload;
	const psr4 = autoload["psr-4"];

	for (const key in psr4) {
		if (Object.prototype.hasOwnProperty.call(psr4, key)) {
			const path: string = psr4[key];

			if (path.startsWith("src")) {
				return key;
			}
		}
	}

	return undefined;
}
