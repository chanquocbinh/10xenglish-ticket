# CMS Ticket & Task Portal - Technical Architecture & Standards

Tài liệu này định nghĩa cấu trúc nền tảng, công nghệ và tiêu chuẩn lập trình dành cho AI và lập trình viên khi triển khai toàn bộ hệ thống.

---

## 1. Công nghệ sử dụng (Tech Stack)

| Thành phần | Công nghệ lựa chọn | Mục đích & Chi tiết |
| --- | --- | --- |
| Thành phần | Công nghệ lựa chọn | Mục đích & Chi tiết |
| --- | --- | --- |
| **Framework** | **Next.js 16.3.5 (App Router)** | Phiên bản mới nhất, tối ưu Server Actions, Turbopack, React 19 Server Components. |
| **State Management** | **Zustand** | Quản lý state toàn cục nhẹ nhàng, typesafe (Project context, modal state, filter state, toast). |
| **Database** | **PostgreSQL** | Cơ sở dữ liệu quan hệ lưu trữ dữ liệu người dùng, project, ticket, task, audit logs. |
| **ORM** | **Prisma ORM** | Schema-first, typesafe query builder, migration tự động. |
| **UI Dashboard** | **Mantis Free React Dashboard (CodedThemes)** | Áp dụng layout: Collapsible Sidebar, Header, Breadcrumbs, Color Palette indigo/blue chuyên nghiệp. |
| **Styling** | **Tailwind CSS** | Framework CSS tiện ích chính cho toàn bộ components và layout. |
| **Authentication** | **JWT (JSON Web Token)** (`jose` / `jsonwebtoken`) | Xác thực người dùng, lưu trữ trong `HttpOnly Secure Cookie`, ký bằng bí mật `JWT_SECRET`, giải mã xác thực trong Middleware. |
| **Validation** | **Zod** | Validate schema cho toàn bộ Form input phía Client và tham số phía Server Actions. |
| **Icons** | **morphicons** (`npm install morphicons`) | Thư viện icon chính thức cho toàn bộ giao diện: menu sidebar, status badge, action buttons. |
| **Local Storage** | **Node.js `fs/promises` + Streaming** | Lưu trữ ảnh/video trực tiếp vào thư mục server nội bộ trong dự án (`/public/uploads/...`), không phụ thuộc cloud bên ngoài. |

---

## 2. Cấu trúc thư mục dự án (Project Directory Structure)

```text
cms-ticket/
├── docs/
│   └── specs/                      # Toàn bộ bộ tài liệu đặc tả kỹ thuật
├── prisma/
│   ├── schema.prisma               # Prisma Schema định nghĩa các bảng dữ liệu
│   └── seed.ts                     # Dữ liệu khởi tạo (Users, Projects, Settings)
├── public/
│   └── uploads/                    # Thư mục lưu trữ tệp tin tải lên máy chủ nội bộ
│       ├── images/
│       └── videos/
├── src/
│   ├── app/                        # Next.js 16.3.5 App Router
│   │   ├── (auth)/                 # Nhóm route xác thực (Login, Change Password)
│   │   │   ├── login/page.tsx
│   │   │   └── change-password/page.tsx
│   │   ├── (dashboard)/            # Nhóm route có giao diện Mantis Dashboard
│   │   │   ├── layout.tsx          # Layout chung: Sidebar + Header + Breadcrumbs
│   │   │   ├── page.tsx            # Dashboard tổng quan
│   │   │   ├── tickets/            # Quản lý Ticket Bug
│   │   │   ├── tasks/              # Kanban Task hàng ngày
│   │   │   ├── sprints/            # Sprint & Backlog
│   │   │   ├── approval/           # Phòng nghiệm thu của Sếp (Sign-off)
│   │   │   ├── users/              # Quản lý tài khoản & phòng ban
│   │   │   └── settings/           # Cấu hình hệ thống & Upload limits
│   │   └── api/                    # Route Handlers
│   │       └── upload/route.ts     # API nhận file upload và validate
│   ├── components/                 # UI Components theo phong cách Mantis
│   │   ├── layout/                 # Sidebar, Header, ProjectSwitcher, Breadcrumb
│   │   ├── ui/                     # Button, Input, Modal, Table, Select, Badge
│   │   ├── tickets/                # TicketForm, TicketTable, CommentSection
│   │   ├── tasks/                  # KanbanBoard, KanbanColumn, TaskCard
│   │   └── approval/               # SignOffCard, AuditLogList
│   ├── stores/                     # Zustand State Management Stores
│   │   ├── useProjectStore.ts      # Store quản lý Project đang active (ALL, LMS, CRM)
│   │   ├── useTicketFilterStore.ts # Store lưu bộ lọc trạng thái, phân hệ, severity
│   │   ├── useTaskKanbanStore.ts   # Store quản lý trạng thái kéo thả Kanban local
│   │   └── useUIStore.ts           # Store điều khiển Sidebar collapse, modal toggle
│   ├── hooks/                      # Custom hooks (useProject, useCurrentUser)
│   ├── lib/                        # Thư viện dùng chung
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── auth.ts                 # Xử lý session và cookie đăng nhập
│   │   ├── storage.ts              # Xử lý ghi/đọc file nội bộ
│   │   └── validations/            # Toàn bộ Zod schemas
│   │       ├── auth.schema.ts
│   │       ├── ticket.schema.ts
│   │       ├── task.schema.ts
│   │       └── setting.schema.ts
│   └── types/                      # TypeScript interfaces và Enums
└── tailwind.config.ts              # Cấu hình màu sắc, phông chữ phong cách Mantis
```

---

## 2.1. Quy chuẩn Quản lý State với Zustand

Hệ thống sử dụng **Zustand** cho Client-side State Management nhằm tránh Prop Drilling và đơn giản hóa việc chia sẻ trạng thái giữa các component giao diện Mantis:

```typescript
// src/stores/useProjectStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProjectScope = 'ALL' | 'LMS' | 'CRM';

interface ProjectState {
  activeProject: ProjectScope;
  setActiveProject: (project: ProjectScope) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      activeProject: 'ALL',
      setActiveProject: (project) => set({ activeProject: project }),
    }),
    {
      name: 'cms-active-project-storage',
    }
  )
);
```

---

## 3. Bản thiết kế Cơ sở dữ liệu (Prisma Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  DEV_ADMIN       // Kỹ thuật viên chính / Quản trị viên cao nhất
  MANAGER         // Sếp / Quản lý - có quyền ký duyệt nghiệm thu
  LEAD_STAFF      // Trưởng bộ phận
  STAFF           // Nhân viên báo lỗi
}

enum ProjectCode {
  LMS             // Project 1: Học Vụ & LMS Học Viên
  CRM             // Project 2: CRM Tuyển Sinh & Kế Toán Vận Hành
}

enum TicketSeverity {
  BLOCKER         // Đỏ: Cháy, dừng hệ thống
  HIGH            // Cam: Lỗi nghiêm trọng
  MEDIUM          // Vàng: Lỗi logic/giao diện
  LOW             // Xám: Lỗi nhẹ, lệch layout
}

enum TicketStatus {
  NEW             // Mới tiếp nhận
  IN_PROGRESS     // Đang xử lý
  RESOLVED        // Đã fix (Chờ test/nghiệm thu)
  APPROVED        // Đã nghiệm thu (Sếp duyệt)
  CLOSED          // Đóng hoàn tất
  REJECTED        // Sếp yêu cầu sửa lại
}

enum TaskType {
  PLANNED         // Task trong kế hoạch Sprint
  UNPLANNED_BOSS  // Task sếp yêu cầu chen ngang đột xuất
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  PENDING_APPROVAL
  DONE
}

model Department {
  id          String   @id @default(uuid())
  name        String   // VD: Học vụ & Đào tạo, Tư vấn Tuyển sinh, Kế toán...
  code        String   @unique
  users       User[]
  createdAt   DateTime @default(now())
}

model User {
  id                  String       @id @default(uuid())
  email               String       @unique
  username            String       @unique
  fullName            String
  passwordHash        String
  isPasswordChanged   Boolean      @default(false) // Bắt buộc đổi mật khẩu ở lần login đầu
  role                Role         @default(STAFF)
  departmentId        String?
  department          Department?  @relation(fields: [departmentId], references: [id])
  ticketsCreated      Ticket[]     @relation("TicketReporter")
  tasksAssigned       Task[]       @relation("TaskAssignee")
  auditLogs           AuditLog[]
  comments            Comment[]
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
}

model Project {
  id          String       @id @default(uuid())
  code        ProjectCode  @unique
  name        String       // "Project 1: Học Vụ & LMS Học Viên"
  description String?
  tickets     Ticket[]
  tasks       Task[]
  sprints     Sprint[]
  createdAt   DateTime     @default(now())
}

model Sprint {
  id          String       @id @default(uuid())
  name        String       // VD: "Sprint 14"
  goal        String?
  projectId   String
  project     Project      @relation(fields: [projectId], references: [id])
  startDate   DateTime
  endDate     DateTime
  capacitySp  Int          @default(24)
  isCurrent   Boolean      @default(false)
  tasks       Task[]
  createdAt   DateTime     @default(now())
}

model Ticket {
  id             String         @id @default(uuid())
  ticketNumber   Int            @unique @default(autoincrement()) // Hiển thị: #TK-101
  title          String
  projectId      String
  project        Project        @relation(fields: [projectId], references: [id])
  submodule      String         // Điểm danh, Đóng học phí, Lịch giáo viên...
  affectedRole   String         // Giáo viên, Học viên, Tư vấn, Kế toán
  severity       TicketSeverity @default(MEDIUM)
  status         TicketStatus   @default(NEW)
  description    String?        // Các bước tái hiện
  evidenceUrls   String[]       // Mảng đường dẫn file đã upload trên server
  reporterId     String
  reporter       User           @relation("TicketReporter", fields: [reporterId], references: [id])
  comments       Comment[]
  auditLogs      AuditLog[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

model Task {
  id             String       @id @default(uuid())
  title          String
  projectId      String
  project        Project      @relation(fields: [projectId], references: [id])
  sprintId       String?
  sprint         Sprint?      @relation(fields: [sprintId], references: [id])
  type           TaskType     @default(PLANNED)
  status         TaskStatus   @default(TODO)
  storyPoints    Int          @default(3)
  assigneeId     String?
  assignee       User?        @relation("TaskAssignee", fields: [assigneeId], references: [id])
  checklists     Json?        // Danh sách subtasks checklist [{title: string, completed: boolean}]
  signoffReason  String?      // Lý do từ chối nếu bị sếp trả về
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model Comment {
  id          String   @id @default(uuid())
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  content     String
  attachments String[]
  createdAt   DateTime @default(now())
}

model AuditLog {
  id          String   @id @default(uuid())
  ticketId    String?
  ticket      Ticket?  @relation(fields: [ticketId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  action      String   // VD: "APPROVE_SIGNOFF", "REJECT_SIGNOFF", "SWAP_SPRINT_TASK"
  detail      String   // Nội dung chi tiết không thể sửa/xóa
  createdAt   DateTime @default(now())
}

model SystemSetting {
  id                   String   @id @default("default")
  allowedFileTypes     String   // Chuỗi phân tách phẩy: "image/png,image/jpeg,video/mp4,video/quicktime"
  maxImageSizeMb       Int      @default(10)   // Giới hạn ảnh MB
  maxVideoSizeMb       Int      @default(50)   // Giới hạn video MB
  allowVideoUpload     Boolean  @default(true) // Bật/tắt upload video
  storageQuotaGb       Int      @default(20)   // Hạn mức lưu trữ trên server
  defaultUserPassword  String   @default("10xEnglish@2026")
  updatedAt            DateTime @updatedAt
}
```

---

## 4. Tiêu chuẩn Giao diện (Mantis Dashboard + Tailwind CSS)

- **Bảng màu chủ đạo (Color Palette):**
  - **Primary:** `indigo-600` (`#4f46e5`), hover `indigo-700`
  - **Success / Approve:** `emerald-600` (`#059669`)
  - **Warning / Boss Sign-off:** `amber-500` (`#f59e0b`)
  - **Danger / Blocker Bug:** `rose-600` (`#e11d48`)
  - **Background:** `slate-50` (`#f8fafc`) cho body, `white` cho cards, `slate-900` cho Sidebar.
- **Card Styling:** `bg-white rounded-xl border border-slate-200 shadow-sm p-4`.
- **Form Controls:** Input, Select, Textarea viền `border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none`.

---

## 5. Tiêu chuẩn Validate bằng Zod
- Toàn bộ tham số Form (Ticket Form, User Form, Task Form, Sign-off Form, Upload Setting Form) phải định nghĩa Schema tại `src/lib/validations/`.
- Không được bypass validation ở Server Action; luôn dùng `schema.safeParse(input)` và trả về mã lỗi `400` kèm message tiếng Việt rõ ràng.
