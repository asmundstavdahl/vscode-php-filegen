import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as ext from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Infer class name from file path', () => {
		assert.strictEqual(
			"Model",
			ext.inferClassNameFromFilePath(
				"/var/www/html/app/src/Component/Model.php"
			)
		);
		assert.strictEqual(
			"iModel",
			ext.inferClassNameFromFilePath(
				"/var/www/html/app/src/Component/iModel.php"
			)
		);
		assert.strictEqual(
			"tModel",
			ext.inferClassNameFromFilePath(
				"/var/www/html/app/src/Component/tModel.php"
			)
		);
	});

	test('Infer project-relative namespace from file path', () => {
		assert.strictEqual(
			"Component",
			ext.inferProjectRelativeNamespaceFromFilePath(
				"/var/www/html/app/src/Component/Model.php"
			)
		);
		assert.strictEqual(
			"Component\\A\\B\\C\\D",
			ext.inferProjectRelativeNamespaceFromFilePath(
				"/var/www/html/app/src/Component/A/B/C/D/E.php"
			)
		);
		assert.strictEqual(
			"Component\\A\\B\\C\\D",
			ext.inferProjectRelativeNamespaceFromFilePath(
				"src/Component/A/B/C/D/E.php"
			)
		);
		assert.strictEqual(
			"Component\\A\\B\\C\\D",
			ext.inferProjectRelativeNamespaceFromFilePath(
				"/src/Component/A/B/C/D/E.php"
			)
		);
		assert.strictEqual(
			"",
			ext.inferProjectRelativeNamespaceFromFilePath(
				"/src/DirectlyInSrc.php"
			)
		);
	});

	test('Get project namespace from composer.json', () => {
		assert.strictEqual(
			"Some\\App\\",
			ext.getProjectNamespaceFromComposerJson(
				`{
    "autoload": {
        "psr-4": {
            "Some\\\\App\\\\": "src/"
        }
    }
}`
			)
		);
	});
	test('Get project namespace from composer.json (project is not first namespace)', () => {
		assert.strictEqual(
			"Some\\App\\",
			ext.getProjectNamespaceFromComposerJson(
				`{
    "autoload": {
        "psr-4": {
            "Some\\\\Other\\\\Namespace\\\\": "other/",
            "Some\\\\App\\\\": "src/"
        }
    }
}`
			)
		);
	});
});

// "Some\\App\\"