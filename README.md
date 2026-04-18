# ATF-playwright-ts

Automation Test Framework built with [Playwright](https://playwright.dev) and TypeScript.  
Structured as an NX monorepo so additional libraries and apps can be added alongside the shared E2E layer.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Project Architecture](#project-architecture)
- [Writing Tests](#writing-tests)
  - [UI Test (Page Object Model)](#ui-test-page-object-model)
  - [API Test](#api-test)
- [CI / CD](#ci--cd)
- [Configuration](#configuration)

---

## Requirements

| Tool | Version |
|---|---|
| Node.js | 18 or 20 (LTS) |
| npm | 9+ |
| Playwright | 1.58+ (installed via `npm ci`) |

---

## Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd ATF-playwright-ts

# 2. Install dependencies
npm ci

# 3. Install Playwright browsers
npx playwright install --with-deps chromium
```

To install all browsers (chromium + firefox):

```bash
npx playwright install --with-deps
```

---

## Running Tests

| Command | What it does |
|---|---|
| `npm test` | All tests (chromium + firefox) |
| `npm run test:ui` | UI tests only |
| `npm run test:api` | API tests only |
| `npm run test:headed` | All tests with a visible browser window |
| `npm run test:debug` | Step through tests in Playwright Inspector |
| `npm run test:report` | Open the last HTML report in the browser |

### Run a single file

```bash
npx playwright test libs/shared-e2e/src/tests/ui/saucedemo.spec.ts
```

### Run by test title

```bash
npx playwright test --grep "TC-UI-05"
```

### Run against a specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
```

---

## Project Architecture

```
ATF-playwright-ts/
├── playwright.config.ts          # Global Playwright configuration
├── package.json                  # Scripts and dependencies
├── tsconfig.base.json            # Shared TypeScript config (@shared/e2e path alias)
│
├── .github/
│   └── workflows/
│       ├── pr-checks.yml         # Runs tests on every PR, blocks merge on failure
│       └── cleanup-branch.yml    # Deletes the source branch after a PR is merged
│
└── libs/
    └── shared-e2e/               # Core E2E library (importable as @shared/e2e)
        └── src/
            ├── index.ts          # Public exports for the library
            │
            ├── pages/            # Page Object Model (POM)
            │   ├── loginPage.ts
            │   ├── sauceDemoLoginPage.ts
            │   ├── inventoryPage.ts
            │   ├── cartPage.ts
            │   └── checkoutPage.ts
            │
            ├── gui/
            │   └── elements/
            │       ├── element-actions.ts   # click, fill, hover, upload, iframe helpers
            │       ├── asserts.ts           # assertion wrappers (text, visibility, URL)
            │       └── wait-manager.ts      # explicit wait strategies
            │
            ├── api/
            │   ├── http/
            │   │   ├── api-client.ts        # Lean HTTP client (GET/POST/PUT/PATCH/DELETE)
            │   │   └── http-methods.ts      # Legacy GET/POST wrapper (kept for compatibility)
            │   ├── services/
            │   │   ├── services.ts          # Service endpoint builder
            │   │   └── services.data.json   # Endpoint configuration
            │   └── utils/
            │       └── crypto-utils.ts      # MD5 hash, sleep, param builder
            │
            ├── helper/
            │   └── ui.ts                    # Email generator, navigation, string utilities
            │
            ├── env/
            │   ├── env-config.ts            # Maps env names to base URLs
            │   ├── env-utils.ts             # goto() driven by ENV variable
            │   └── test.env.data.json       # URL values per environment
            │
            ├── common-steps/
            │   ├── ui-steps.ts              # BDD-style UI step container (extend as needed)
            │   └── api-steps.ts             # BDD-style API step container (extend as needed)
            │
            ├── data/
            │   ├── locators/
            │   │   └── dynamic.data.elements.json   # Shared XPath patterns
            │   └── test-data/
            │       └── test.data.json               # Shared test data
            │
            ├── report/
            │   └── custom-reporter.ts       # Custom console reporter (hooks onTestEnd etc.)
            │
            └── tests/                       # Test suites
                ├── login.spec.ts            # Example login tests
                ├── ui/
                │   └── saucedemo.spec.ts    # 10 UI tests — saucedemo.com
                └── api/
                    └── reqres.spec.ts       # 10 API tests — jsonplaceholder.typicode.com
```

### Layer responsibilities

```
┌─────────────────────────────────────────────┐
│                  Test Suites                │  tests/**/*.spec.ts
│  describe / test blocks, assertions         │
└────────────────────┬────────────────────────┘
                     │ uses
┌────────────────────▼────────────────────────┐
│              Page Object Model              │  pages/*.ts
│  Locators, page actions, navigation         │
└──────────┬─────────────────┬────────────────┘
           │ uses            │ uses
┌──────────▼──────┐  ┌───────▼────────────────┐
│   GUI Helpers   │  │      API Client        │
│ ElementActions  │  │  ApiClient (HTTP verbs)│
│ WaitManager     │  └────────────────────────┘
│ Asserts         │
└─────────────────┘
```

---

## Writing Tests

### UI Test (Page Object Model)

**1. Create a page object** in `libs/shared-e2e/src/pages/`:

```typescript
// libs/shared-e2e/src/pages/dashboardPage.ts
import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.locator('h1.dashboard-title');
  }

  async goto() {
    await this.page.goto('https://your-app.com/dashboard');
  }
}
```

**2. Write the test** in `libs/shared-e2e/src/tests/ui/`:

```typescript
// libs/shared-e2e/src/tests/ui/dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/dashboardPage';

test.describe('Dashboard', () => {
  test('heading is visible after login', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.heading).toHaveText('Welcome');
  });
});
```

---

### API Test

Use `ApiClient` for full HTTP verb support and unrestricted status code assertions:

```typescript
// libs/shared-e2e/src/tests/api/products.spec.ts
import { test, expect } from '@playwright/test';
import { ApiClient } from '../../api/http/api-client';

const client = new ApiClient('https://your-api.com');

test.afterAll(() => client.dispose());

test('GET /products returns 200 with a list', async () => {
  const response = await client.get('/products');

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
});

test('POST /products with missing fields returns 422', async () => {
  const response = await client.post('/products', { body: {} });

  expect(response.status()).toBe(422);
});
```

---

## CI / CD

Every pull request targeting `main` triggers **`pr-checks.yml`**:

```
push to PR branch
       │
       ▼
┌──────────────────────────────────┐
│       Playwright Tests           │
│  ┌─────────────┐ ┌────────────┐  │
│  │  UI shard   │ │  API shard │  │  (run in parallel)
│  └──────┬──────┘ └─────┬──────┘  │
└─────────┼──────────────┼─────────┘
          │  both must   │
          └─────┬────────┘
                ▼
         merge allowed?
         YES if all pass
         NO  if any fail
```

After a PR is merged, **`cleanup-branch.yml`** automatically deletes the source branch.  
Protected branches (`main`, `master`, `release/*`, `hotfix/*`) are never deleted.

### Enabling the merge gate

In your GitHub repository:

1. Go to **Settings → Branches**
2. Add a branch protection rule for `main`
3. Enable **"Require status checks to pass before merging"**
4. Add both required checks:
   - `Playwright Tests (ui)`
   - `Playwright Tests (api)`
5. Optionally enable **"Require branches to be up to date before merging"**

---

## Configuration

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `CI` | `false` | Enables retries (2), limits workers (4), stricter settings |
| `ENV` | — | Target environment (`staging`, `production`, `localhost`) used by `env-utils.ts` |

### Adding a new environment URL

Edit `libs/shared-e2e/src/env/test.env.data.json`:

```json
{
  "environment": {
    "staging":    "https://staging.your-app.com",
    "production": "https://your-app.com",
    "localhost":  "http://localhost:3000"
  }
}
```

Then run tests against that environment:

```bash
ENV=staging npm test
```

### Playwright config highlights (`playwright.config.ts`)

| Setting | Value |
|---|---|
| Test directory | `libs/shared-e2e/src/tests` |
| Timeout per test | 30 s |
| Expect timeout | 10 s |
| Retries (CI) | 2 |
| Workers (CI) | 4 |
| Browsers | chromium, firefox |
| Reporter | list (terminal) + HTML |
| Artifacts on failure | screenshot + trace + video |
