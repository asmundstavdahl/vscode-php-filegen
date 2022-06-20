# vscode-php-filegen

Generate basic content of class/interface/trait files based on the project context.

## Features

- Generate a namespaced class/interface/trait in an empty file based on the project context.
- Decides what to generate based on the filename
    - Files starting with "i" get an interface generated (iInterfaceName.php => interface iInterfaceName)
    - Files starting with "t" get a trait generated (tTraitName.php => trait tTraitName)
    - Other files get a class generated (SomeClass.php => class SomeClass)

![Generate namespaced class](assets/images/vscode-php-filegen.gif)

## Requirements

1. your source files must be in the `src` directory
2. your project must be PSR-4 autoloading configured in `composer.json`
3. currently, your PSR-4 autoloading for `src` must be the first namespace of autoload.psr-4 in composer.json

## Extension Settings

No settings available at this point.

## Known Issues

Quirky base namespace inference from composer.json.

## Release Notes

Release nooooooooootesah.

### 0.1.2

Don't add "namespace ;" to files in the root namespace.

### 0.1.0

New setting for composer.json location.

### 0.0.1

Initial release.
