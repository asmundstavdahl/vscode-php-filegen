# Change Log

Notable changes will be documented in this file.

## [v0.1.0] 2022-05-28
### Breaking changes
- generate command renamed to "php-filegen.generateNamespacedFile"

### Added
- setting for location of composer.json

### Changed
- refactored internals
- more tests

### Fixed
- there will no longer be a trailing backslash in the namespace of files directly in the autoload root

## [v0.0.2]

## [v0.0.1] Barely functional

- Initial release
- infers namespace from file path and composer.json PSR-4 autoload config
- infers whether to generate class, interface or trait based on file name
