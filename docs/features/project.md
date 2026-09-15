ở super admin sẽ có thể tạo được project và gán user tham gia project nào. Có thể gán nhiều project cho user:
- có cơ chế switch nhanh project để triẻn khai thao tác trên cms

**Kiến trúc Multi-Project & Cơ chế Switch Workspace**

---

**1. Thiết kế Cơ sở dữ liệu (Prisma Schema)**

Mối quan hệ Nhiều - Nhiều (Many-to-Many) qua bảng trung gian `ProjectMember` để lưu vai trò cụ thể của User trong từng Project:

model User {
  id              String          @id @default(uuid())
  email           String          @unique
  name            String
  systemRole      SystemRole      @default(STAFF)
  defaultProjectId String?        // Dự án truy cập mặc định khi vừa login
  memberships     ProjectMember[]
  createdAt       DateTime        @default(now())
}

model Project {
  id          String          @id @default(uuid())
  name        String
  code        String          @unique // VD: LMS, CRM, PORTAL
  description String?
  isActive    Boolean         @default(true)
  members     ProjectMember[]
  createdAt   DateTime        @default(now())
}

model ProjectMember {
  id        String      @id @default(uuid())
  userId    String
  projectId String
  role      ProjectRole @default(MEMBER)
  joinedAt  DateTime    @default(now())

  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@index([userId])
  @@index([projectId])
}

```

---

**2. Quản lý phân quyền Super Admin**

* **Tạo Project:** Super Admin truy cập `/admin/projects/new` để nhập tên, mã code và mô tả dự án.
* **Gán User vào nhiều Project:**
* Tại giao diện chi tiết User hoặc chi tiết Project, Super Admin dùng UI Multi-Select (hộp kiểm hoặc autocomplete chips) để thêm/bớt nhiều project cùng lúc.
* API backend xử lý transactional upsert/delete vào bảng `ProjectMember`.



---

**3. Cơ chế Switch Project Nhanh (Next.js)**

Lựa chọn tối ưu nhất cho Next.js App Router là kết hợp **URL Slug/Route** hoặc **Cookie Context**:

* **Cách 1: Route Prefix (Khuyên dùng - Chuẩn Linear/Jira):**
* Cấu trúc URL: `/[projectCode]/tickets`, `/[projectCode]/sprint`, `/[projectCode]/board`.


* Khi switch project, chỉ cần redirect URL: `router.push("/CRM/tickets")`.
* *Ưu điểm:* Dễ copy link gửi cho sếp hoặc đồng nghiệp, reload không mất context, hỗ trợ mở nhiều tab nhiều project khác nhau cùng lúc mà không bị đá context.


* **Cách 2: Cookie Context (Stateful Header Switcher):**
* Lưu `current_project_id` vào Cookie (HTTP-only hoặc readable client).
* Component Dropdown ở góc trên Header hiển thị danh sách các project user được gán.
* Khi chọn item mới:
1. Cập nhật cookie `current_project_id`.
2. Gọi `router.refresh()` để Server Components re-fetch dữ liệu tương ứng của project mới.





---

**4. UI Switcher Component (Góc Header/Sidebar)**

* **Vị trí:** Đặt tại Header trên cùng bên trái (ngay cạnh Logo) hoặc góc trên cùng của Sidebar.
* **Tương tác:**
* Nhấn dropdown hiển thị: Tên project hiện tại, icon và mã code.
* Menu popover liệt kê danh sách project user có quyền truy cập, kèm thanh tìm kiếm nhanh nếu có nhiều project.
* Super Admin luôn thấy tùy chọn `+ Tạo Project mới` hoặc `Quản lý phân quyền` ngay cuối dropdown menu.



---

**5. Middleware & Bảo mật Truy cập Project**

Mỗi khi người dùng truy cập dữ liệu liên quan đến project (qua URL hoặc API):

```typescript
// middleware.ts hoặc logic kiểm tra tại Data Fetching
const user = await getCurrentUser();

if (user.systemRole !== "SUPER_ADMIN") {
  const hasAccess = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: targetProjectId,
      },
    },
  });

  if (!hasAccess) {
    // Chặn truy cập nếu user không được gán vào project này
    return redirect("/unauthorized");
  }
}

```