# Kiến trúc CMS Ticket (Clean Architecture + Modules)

## Nguyên tắc phụ thuộc

```
app/ (routing)  ->  modules/<domain>  ->  core/ , shared/
```

- `app/**` **chỉ** làm routing: guard quyền, gọi service để lấy dữ liệu, render component của module. Không có `prisma`, không có logic nghiệp vụ, không có `'use client'` state lớn.
- `modules/<domain>` sở hữu toàn bộ nghiệp vụ của một miền: schema, repository, service, actions, components, hooks, constants.
- `core/**` là hạ tầng dùng chung, **không** biết gì về UI: env, prisma, JWT/session, permission, error, result, audit log, project scope.
- `shared/**` là UI/state dùng chung: design-system components, layout, zustand store, hook, util.
- Module **không** import chéo tầng trong của module khác: chỉ dùng `*.service.ts`, `*.actions.ts`, `*.types.ts`, `*.constants.ts` hoặc `components/` của module khác. `*.repository.ts` là nội bộ module.

## Cấu trúc một module

```
src/modules/<domain>/
  <domain>.types.ts        # DTO / view model
  <domain>.schema.ts       # zod schema (input biên ngoài)
  <domain>.repository.ts   # truy cập prisma, KHÔNG authz, KHÔNG audit
  <domain>.service.ts      # business rule + authz + audit; ném AppError
  <domain>.actions.ts      # 'use server': parse input -> service -> revalidatePath
  <domain>.constants.ts    # nhãn, màu, danh sách option
  components/              # UI của miền (client component)
  hooks/                   # hook gọi action / state form của miền
```

## Hợp đồng tầng

| Tầng | Được phép | Không được phép |
| --- | --- | --- |
| repository | `prisma`, kiểu Prisma | authz, audit, `revalidatePath`, throw lỗi nghiệp vụ |
| service | repository, `writeAuditLog`, `AppError`, `hasPermission` | `prisma` trực tiếp, `revalidatePath`, đọc cookie thô |
| actions | `runAction`, `requireUser`/`requirePermission`, service, `revalidatePath` | prisma, logic nghiệp vụ |
| page/layout | `requirePageUser`/`requirePagePermission`, service query, component module | prisma, action mutation |
| client component | actions, `useServerAction`, store, shared ui | prisma, service |

## API `core` dùng chung

- `@/core/config/env` — `env`, `AUTH_COOKIE_NAME`, `ACTIVE_PROJECT_COOKIE_NAME`, `SYSTEM_SETTING_ID`, `DEFAULT_USER_PASSWORD`, `PASSWORD_SALT_ROUNDS`.
- `@/core/db/prisma` — `prisma` (chỉ repository import).
- `@/core/auth/jwt` — `signJWT`, `verifyJWT` (edge-safe, dùng cả middleware).
- `@/core/auth/session` — `getCurrentUser`, `setAuthCookie`, `clearAuthCookie`.
- `@/core/auth/permissions` — `hasPermission`, `ALL_PERMISSIONS`.
- `@/core/auth/auth.types` — `AuthJWTPayload`, `Permission`, `PERMISSION_VALUES`.
- `@/core/errors` — `AppError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ValidationError`, `ConflictError`.
- `@/core/result` — `ActionResult<T>`, `ok()`, `fail()`.
- `@/core/server/action` — `runAction`, `requireUser`, `requirePermission`, `ActionContext`.
- `@/core/server/page` — `requirePageUser`, `requirePagePermission`.
- `@/core/audit/audit.service` — `writeAuditLog`, `findRecentAuditLogs`.
- `@/core/project-scope` — `getActiveProjectScope`, `projectScopeWhere`, `ProjectScope`.

## Kết quả trả về của action

Mọi server action trả `ActionResult<T>`:

```ts
{ success: true, data: T } | { success: false, error: string, code?: string }
```

Client gọi qua `useServerAction` (`@/shared/hooks/useServerAction`) để có sẵn `isLoading`, `error`, tự `router.refresh()`.

## Thêm một miền mới

1. Tạo `src/modules/<domain>/` theo bộ file trên.
2. Repository chỉ viết truy vấn; service ghép rule + `writeAuditLog`; action bọc `runAction`.
3. Trang `app/**/page.tsx` gọi `requirePage*` + service query, render component module.

## Cổng chặn request

`src/proxy.ts` (Next 16 đổi tên `middleware` → `proxy`) là guard duy nhất: chưa đăng nhập → `/login`, còn mật khẩu mặc định → `/change-password`, token sai/hết hạn → xoá cookie. Nó chỉ dùng `verifyJWT` (edge-safe), không gọi prisma.

## Bản đồ file cũ → mới

| Cũ | Mới |
| --- | --- |
| `src/lib/prisma.ts` | `src/core/db/prisma.ts` |
| `src/lib/auth.ts` | `src/core/auth/jwt.ts` + `src/core/auth/session.ts` |
| `src/lib/permissions.ts` | `src/core/auth/permissions.ts` + `src/modules/roles/roles.constants.ts` (nhãn) |
| `src/types/auth.ts` | `src/core/auth/auth.types.ts` |
| `src/lib/date.ts` | `src/shared/utils/date.ts` |
| `src/lib/storage.ts` | `src/modules/storage/storage.service.ts` |
| `src/lib/validations/<x>.schema.ts` | `src/modules/<domain>/<domain>.schema.ts` |
| `src/app/actions/<x>.actions.ts` | `src/modules/<domain>/<domain>.actions.ts` (+ `.service.ts`, `.repository.ts`) |
| `src/stores/useUIStore.ts`, `useProjectStore.ts` | `src/shared/stores/ui.store.ts`, `project.store.ts` |
| `src/components/ui/**`, `src/components/layout/**` | `src/shared/ui/**`, `src/shared/layout/**` |
| `src/app/(dashboard)/**/XxxClientView.tsx` | `src/modules/<domain>/components/**` |
| `src/middleware.ts` | `src/proxy.ts` |
