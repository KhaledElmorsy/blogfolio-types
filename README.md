# 📦 Blogfolio Types (Shared Utility Package)

[![TypeScript](https://img.shields.io/badge/TypeScript-Advanced-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Zod](https://img.shields.io/badge/Zod-Validation-3068b7?logo=zod)](https://zod.dev/)
[![Testing](https://img.shields.io/badge/Vitest-Passing-success?logo=vitest)](https://vitest.dev/)
[![NPM](https://img.shields.io/badge/NPM-Package-red?logo=npm)](https://www.npmjs.com/)

> The Single Source of Truth (SSoT) enforcing 100% End-to-End Type Safety across the Blogfolio CMS ecosystem.

This repository is a custom, standalone utility package that serves as the architectural bridge between the [Blogfolio Server](https://github.com/KhaledElmorsy/blogfolio-server) and the [Blogfolio Client](https://github.com/KhaledElmorsy/blogfolio-client). Rather than duplicating interfaces and hoping they stay synchronized, this package exports composable **Zod schemas, strict Error registries, and full Endpoint contracts** to completely eliminate API drift and runtime type errors.

## ✨ Engineering Highlights

This package goes far beyond basic type definitions. It implements advanced TypeScript mechanics and custom Zod wrappers to create a bulletproof contract-driven ecosystem:

### 1. Advanced TypeScript Mechanics & Generic Architecture
To ensure seamless developer experience and zero-overhead type safety, this package leverages several highly advanced TypeScript features:
* **Recursive Mapped Types & Template Literals:** The `uniqueIDTree` uses deep recursion and template literal inference (`${S}${x}.`) to flatten heavily nested object trees and extract leaf nodes entirely at compile time.
* **Contravariance & Inference:** Utilizes advanced generic inference techniques (e.g., `UnionToIntersection<T>`), leveraging function argument contravariance to dynamically transform union types into deeply merged intersections.
* **Complex Generic Constraints:** Built dynamic wrapper types like `InferEndpoint<T>` and `ControllerSchema<T>` that utilize conditional types to automatically infer `Zod` shapes into pure TypeScript interfaces. This allows the frontend and backend to consume exact request/response signatures without a single manual type assertion (`as Type`).

### 2. Strict Endpoint Contracts & Discriminated Unions
* Every API route is defined as an `EndpointSchema` object detailing exact `request` (body, params, query) and `response` schemas.
* **Discriminated Unions:** Responses are heavily constrained unions of `zSuccessResponse` and `zFailureResponse`. By utilizing HTTP status codes as discriminators, the frontend TypeScript compiler *forces* the UI to exhaustively handle every single possible success, error, and validation state.

### 3. Compile-Time Error Registry (`uniqueIDTree`)
* Instead of relying on arbitrary string messages, the entire ecosystem uses a centralized dictionary of Application Errors (`ErrorID`).
* Engineered a highly advanced recursive TypeScript utility (`uniqueIDTree.ts`) that **statically analyzes the entire error dictionary at compile-time**, throwing TS compilation errors if duplicate error `code`s or `message`s are detected across any domain. 
* This guarantees that every error thrown by the API and consumed by the client is deterministic and globally unique.

### 4. Custom Zod Error Injection (`zWithErrors`)
* Zod natively handles validation issues using standard string messages. I authored a custom `zWithErrors` factory wrapper that hijacks Zod's failure states.
* It injects serialized, heavily-typed `ErrorIDString` payloads (e.g., `210|Username can't be shorter...`) into the Zod issue paths. The backend throws these exact codes, and the client automatically parses them back into actionable UI state.

### 5. Advanced Query Serialization (`queryArray`)
* Designed a custom Zod effect (`queryArray.ts`) to securely parse and validate complex relational URL query parameters (e.g., `?sort=followerCount:asc,firstName:desc`).
* Ensures that deeply nested or alphanumeric URL parameters are strictly validated and transformed into usable JavaScript objects before ever reaching the backend controllers.

## 🛠️ Tech Stack

* **Language:** TypeScript (Advanced Mapped Types, Conditional Types, Inference)
* **Validation:** Zod
* **Testing:** Vitest
* **Build Tools:** `tsc`, `ts-patch`, `typescript-transform-paths` (for clean module alias resolution in the compiled output)

## 📂 Architecture & Directory Structure

```text
src/
├── {Domain}/             # e.g., User/, Post/, Emote/, Project/
│   ├── {Domain}.ts       # Domain Zod schemas and complete Endpoint schema definitions
│   ├── ErrorIDs.ts       # Domain-specific base error code/message definitions
│   └── index.ts          # Clean exports
├── Response/             # Base types/schemas for HTTP Responses and Status Code Enums
├── ResponseError/        # Error serialization logic and the uniqueIDTree compiler
├── util/                 # Advanced TS generic helpers (InferZodRecord, UnionToIntersection)
└── index.ts              # Global package entry point
```

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* npm (or yarn)

### Local Development Setup

Because this is a dependency used by the Client and Server, you can use `npm link` or `yarn link` to develop it locally alongside the other repositories.

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Run the Build:**
   Compiles the TypeScript source into the `build/` directory with path aliases automatically resolved.
   ```bash
   yarn build
   ```

3. **Run Tests:**
   Executes the Vitest suite, specifically validating the custom Zod wrappers, Error ID serialization, and complex `queryArray` parsing logic.
   ```bash
   yarn test
   ```

4. **Linting:**
   ```bash
   yarn lint
   ```
