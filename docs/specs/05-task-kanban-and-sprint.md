# Module 05: Task Kanban, Sprint & Cơ Chế Cân Bằng Tải (Sprint Capacity Guard)

Tài liệu này đặc tả giao diện Kanban quản lý nhiệm vụ hàng ngày, chu kỳ Sprint 1-2 tuần, phân định nguồn việc và cơ chế bảo vệ khối lượng công việc khi Sếp yêu cầu việc phát sinh đột xuất.

---

## 1. Yêu cầu nghiệp vụ

### 1.1. Phân loại nguồn việc (Work Origin)
- **Task Kế hoạch (`PLANNED`):** Các tính năng hoặc công việc kỹ thuật đã được thống nhất từ buổi Sprint Planning đầu tuần.
- **Task Đột xuất của Sếp (`UNPLANNED_BOSS`):** Các yêu cầu chen ngang giữa tuần từ ban giám đốc (Ví dụ: *"Sửa gấp mẫu in phiếu thu cho cơ sở mới mở"*, *"Thêm bộ lọc tìm số điện thoại phụ huynh"*).
- Phải gắn nhãn nổi bật màu vàng hổ phách (`⚡ ĐỘT XUẤT - SẾP YÊU CẦU`) để cuối tuần thống kê minh chứng vì sao các task trong kế hoạch bị chậm trễ.

### 1.2. Cơ chế Bảo Vệ Tải Sprint (Sprint Capacity Guard)
- Mỗi Sprint có định mức năng lực (Capacity), ví dụ: `24 Story Points (SP)`.
- Khi Sếp hoặc Quản lý muốn thêm 1 task mới vào Sprint đang chạy:
  - Hệ thống tính toán tải: Nếu tổng SP vượt quá định mức (ví dụ: > 85%), hệ thống **bật Modal cảnh báo cân đối tải**.
  - Buộc người tạo phải chọn: **"Đẩy lùi 1 task tương đương ra khỏi Sprint này sang Sprint tiếp theo"**.
  - Ghi log lưu vết vào bảng `AuditLog`: *"Sếp Tuấn đã thêm task X (4 SP) và đồng ý hoãn task Y (4 SP) sang Sprint sau"*.

---

## 2. Zod Schema Validation

File: `src/lib/validations/task.schema.ts`
```typescript
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(5, 'Tiêu đề nhiệm vụ tối thiểu 5 ký tự').max(200),
  projectId: z.string().min(1, 'Vui lòng chọn Dự án'),
  sprintId: z.string().optional(),
  type: z.enum(['PLANNED', 'UNPLANNED_BOSS']).default('PLANNED'),
  storyPoints: z.number().int().min(1).max(13, 'Story Points từ 1 đến 13 SP'),
  assigneeId: z.string().optional(),
  checklists: z.array(z.object({
    title: z.string().min(1),
    completed: z.boolean().default(false),
  })).optional().default([]),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'PENDING_APPROVAL', 'DONE']),
});

export const swapSprintTaskSchema = z.object({
  newTask: createTaskSchema,
  postponedTaskId: z.string().uuid('Vui lòng chọn task cần đẩy lùi sang Sprint sau'),
  bossReason: z.string().min(5, 'Lý do sếp yêu cầu đổi việc tối thiểu 5 ký tự'),
});
```

---

## 3. Giao diện Kanban Board (Mantis Style)

Route: `/tasks`

### 3.1. Cấu trúc 4 Cột Tiến Độ
1. **CẦN LÀM (TO DO):** Các việc chưa bắt đầu.
2. **ĐANG LÀM (IN PROGRESS):** Việc Dev đang code hoặc sửa lỗi (có nhãn thời gian đang chạy).
3. **CHỜ SẾP TEST (PENDING APPROVAL):** Việc Dev đã hoàn tất, đã deploy lên Staging, chờ Sếp ký duyệt UAT.
4. **ĐÃ XONG (DONE):** Đã được Sếp bấm duyệt nghiệm thu, sẵn sàng đưa lên Production.

### 3.2. Cấu trúc một Card Công Việc (Task Card)
- **Huy hiệu Project:** `LMS` (Màu tím) hoặc `CRM` (Màu xanh).
- **Huy hiệu Nguồn việc:** `Kế hoạch` hoặc `⚡ ĐỘT XUẤT`.
- **Tiêu đề công việc:** In đậm rõ ràng.
- **Checklist Sub-tasks:** Hiển thị số lượng checklist hoàn thành (ví dụ: `☑ 2/3 checklist`).
- **Story Points & Thời gian ước tính:** `3 SP • 2h`.
- **Avatar người thực hiện:** Ký hiệu chữ cái viết tắt (VD: `DH`).

### 3.3. Quản lý Trạng Thái Kéo Thả Bằng Zustand (`useTaskKanbanStore`)
- Để bảng Kanban mượt mà không bị giật lag khi kéo thả, sử dụng **Zustand store** để cập nhật trạng thái ngay lập tức trên UI (Optimistic Update):
  ```typescript
  // src/stores/useTaskKanbanStore.ts
  import { create } from 'zustand';

  interface TaskItem {
    id: string;
    title: string;
    status: 'TODO' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'DONE';
    // ...
  }

  interface TaskKanbanState {
    tasks: TaskItem[];
    setTasks: (tasks: TaskItem[]) => void;
    moveTask: (taskId: string, targetStatus: TaskItem['status']) => void;
  }

  export const useTaskKanbanStore = create<TaskKanbanState>((set) => ({
    tasks: [],
    setTasks: (tasks) => set({ tasks }),
    moveTask: (taskId, targetStatus) =>
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t)),
      })),
  }));
  ```
- Khi user kéo thả task qua cột khác:
  1. Gọi `moveTask(taskId, newStatus)` trong Zustand để thẻ nhảy cột ngay lập tức (0ms).
  2. Bắn Server Action ngầm `updateTaskStatus(taskId, newStatus)`.
  3. Nếu Server Action lỗi, rollback trạng thái cũ và bắn Toast cảnh báo.

---

## 4. Quản lý Feature & Sprint (Roadmap & Sprints)

Route: `/sprints`

### 4.1. Product Backlog theo Project
- Là kho lưu trữ các ý tưởng tính năng của Sếp trong tương lai (đề xuất nhưng chưa chốt làm ngay trong tuần này).
- Tách biệt rõ 2 tab:
  - Tab 1: *Ý tưởng Học Vụ LMS (Ví dụ: AI chấm phát âm, thi thử IELTS tự động).*
  - Tab 2: *Ý tưởng Vận Hành CRM (Ví dụ: Zalo ZNS chúc mừng sinh nhật, App phụ huynh PWA).*
- Nút bấm **"Đẩy vào Sprint"**: Chuyển việc từ Backlog vào Sprint đang chạy (kích hoạt kiểm tra dung lượng).

### 4.2. Thanh Đồng Hồ Đo Năng Lực Sprint (Capacity Meter)
- Thanh tiến độ hiển thị 3 dải màu:
  - Dải xanh indigo: Khối lượng công việc theo kế hoạch ban đầu (15 SP).
  - Dải vàng cam: Khối lượng việc Sếp yêu cầu chen ngang giữa tuần (6 SP).
  - Dải xám: Dung lượng dự phòng còn lại cho Bug khẩn cấp (3 SP).

---

## 5. Checklist Kiểm Thử & Triển Khai (DoD)

- [ ] Kéo thả hoặc bấm nút chuyển trạng thái task giữa 4 cột cập nhật tức thì qua Server Action.
- [ ] Checklist trong từng task có thể tick chọn hoàn thành trực tiếp mà không cần tải lại trang.
- [ ] Khi tổng SP trong Sprint vượt quá `capacitySp`, Modal `swapSprintTask` tự động hiện lên buộc chọn task bù trừ.
- [ ] Khi chọn task bù trừ, task được chọn tự động gỡ khỏi `sprintId` hiện tại và ghi log vào `AuditLog`.
