# Elite Test Strategy

This document outlines the testing strategy for the Kachikaly Crocodile Pool immersive experience.

## 1. Testing Pyramid

We adhere to a layered testing approach to ensure functional correctness, regression safety, and deployment confidence.

### 1.1. Unit Tests (Vitest + React Testing Library)
- **Goal:** Verify the correctness of individual components and logic in isolation.
- **Scope:**
    - Pure logic functions.
    - React components (Arrival, PoolView) in isolation.
    - State transitions and effect triggers.
- **Tools:** Vitest, @testing-library/react, jsdom.
- **Why:** Fast feedback, ensures logic integrity, documents component behavior.

### 1.2. Integration Tests (Vitest + React Testing Library)
- **Goal:** Verify that components work together correctly.
- **Scope:**
    - `App.jsx` composition (Arrival + PoolView).
    - Interaction between parent and child components.
- **Tools:** Vitest, @testing-library/react.
- **Why:** Catch issues in component communication and data flow.

### 1.3. End-to-End (E2E) Tests (Playwright)
- **Goal:** Verify the full user journey from a user's perspective.
- **Scope:**
    - Critical user flows:
        - Arrival animation.
        - Interaction with the pool (depth/zoom).
        - Text reveals based on proximity.
        - Idle state behavior.
    - Cross-browser compatibility.
- **Tools:** Playwright.
- **Why:** Ensure the application works as expected in a real browser environment, catching visual and interaction bugs.

## 2. Test Priorities

| Component | Priority | Justification |
| :--- | :--- | :--- |
| **PoolView.jsx** | Critical | Core experience. Handles parallax, zoom, and dynamic text. High complexity. |
| **Arrival.jsx** | High | First impression. Must handle animation and callback correctly. |
| **App.jsx** | Medium | Orchestration. Simple but essential. |
| **Background.jsx** | Low | Visual only. Low logic risk. |

## 3. Coverage & Quality Gates

- **Code Coverage:**
    - Goal: > 80% Statement Coverage.
    - Critical paths must be 100% covered.
- **Linting:**
    - ESLint must pass without errors.
- **CI/CD:**
    - All tests must pass on every Pull Request.
    - Deployment to production is blocked on test failure.

## 4. Execution Plan

1.  **Unit & Integration Tests:** Run `npm run test` (Vitest).
2.  **E2E Tests:** Run `npm run test:e2e` (Playwright).
3.  **CI Pipeline:** GitHub Actions triggers on push/PR.

## 5. Maintenance

- Tests should be refactored alongside code.
- Flaky tests (especially E2E) must be fixed or quarantined immediately.
- Use explicit waits and deterministic selectors in E2E tests.
