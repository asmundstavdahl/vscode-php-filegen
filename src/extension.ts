// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { match } from 'assert';
import { Dir, fstat, readFileSync } from 'fs';
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-php-filegen.generate-namespaced', () => {
		// The code you place here will be executed every time your command is executed

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
		let srcSplit = fileName.split('/src/');
		const fileInAutoloadDir = srcSplit.pop();
		const projectRoot = srcSplit.join('/src/');

		if (fileInAutoloadDir === undefined) {
			throw new Error("Could not extract file's path relative to autoload root");
		}

		const projectNamespace = getProjectNamespace(projectRoot);
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

		const namespace = `${projectNamespace}\\${fileNamespace}`;

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
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

function getProjectNamespace(projectRoot: string) {
	const composerJson_ = readFileSync(`${projectRoot}/composer.json`).toString();
	const composerJson = JSON.parse(composerJson_);
	const autoload = composerJson.autoload;
	const psr4 = autoload["psr-4"];

	return Object.keys(psr4)[0];
}

function getFileNamespace(fileInAutoloadDir: string) {
	return fileInAutoloadDir
		.split("/")
		.slice(0, -1)
		.join("\\");
}

function getFileClassName(fileInAutoloadDir: string) {
	return fileInAutoloadDir.split("/").slice(-1)[0].split(".").slice(0, 1)[0];
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
