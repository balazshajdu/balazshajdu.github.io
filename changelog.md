# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) with some changes for personal preference.

## [DEV 0.0.3 (to do)] - 2025.08.

### To add / change / remove / fix / security
- Based on results of testing the TEST 0.0.2 (copy of DEV 0.0.2) in PROD environment with dummy content by an outside tester.

## [DEV 0.0.2 (unreleased)] - 2025.07.17.

### Added
- Date and time info which is shown after the first succesful decryption if the page gets reloaded. This info will be shown until the tab is closed. (Use case: the user reloads the page to check for new content without typing in the password. The content won't display after the reload. When the user sees that the date and time has changed, they type in the password to decrypt the changed content and display it for reading.)
- Favicon.

### Changed
- Removed the HTML input field for the password and implemented a JS EventListener instead to tidy up the page.

## [DEV 0.0.1 (unreleased)] - 2025.07.14.

### Added
- Basic HTML site.
- Basic CSS styling.
- JS code for password input, encrypted file decryption, display of file content.
