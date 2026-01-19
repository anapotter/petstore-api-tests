# Allure Report Guide

## 🎯 Quick Start

### View Allure Report (Easiest)
```bash
npm run test:allure
```
This runs tests and automatically opens the report.

### View Existing Results
```bash
npm run allure:serve
```
Opens interactive report from last test run. Press Ctrl+C to stop the server.

### Generate Static Report
```bash
npm run allure:generate
npm run allure:open
```

## 📊 What You'll See

The Allure report provides:
- **Overview**: Total tests, pass rate, duration
- **Suites**: Tests organized by test suites
- **Graphs**: Visual representation of test results
- **Timeline**: Execution timeline for parallel tests
- **Categories**: Failed tests categorized by error type
- **Behaviors**: Tests organized by features/stories

## 🔍 Features

- Beautiful, interactive UI
- Request/response details
- Step-by-step test execution
- Screenshots and attachments
- Historical trends (when configured)
- Categories and tags
- Execution timeline

## 📝 Report Location

- s**: `allure-results/` (JSON data)
- **Report**: `allure-report/` (HTML files)
- Both folders are git-ignored

## 💡 Tips

1. Keep the server running to refresh results after each test run
2. Use `npm run test:allure` for a fresh report each time
3. The report opens automatically in your default browser
4. Press Ctrl+C in the terminal to stop the Allure server
