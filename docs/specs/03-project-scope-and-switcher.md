# Module 03: Phân Tuyến & Bộ Chọn Đa Dự Án (Project Scope & Switcher)

Tài liệu này đặc tả cơ chế phân tách 2 nhánh dự án độc lập trong trung tâm, bộ chọn dự án toàn cục (Project Switcher) và cách dữ liệu tự động đồng bộ theo ngữ cảnh.

---

## 1. Yêu cầu nghiệp vụ

Hệ thống của trung tâm tiếng Anh vận hành 2 nhánh dự án độc lập, không báo lỗi và tính điểm gộp chung:

| Thuộc tính | Project 1: Học Vụ & LMS Học Viên | Project 2: CRM Tuyển Sinh & Kế Toán Vận Hành |
| --- | --- | --- |
| **Mã Project** | `LMS` | `CRM` |
| **Đối tượng dùng** | Giáo viên, Trợ giảng, Học viên, Phụ huynh | Nhân viên Sale/Tư vấn, Lễ tân, Kế toán, Quản lý cơ sở |
| **Phân hệ chính** | - Điểm danh & Sĩ số lớp học<br>- Bài tập & Chấm điểm Speaking/Writing<br>- Lịch dạy & Đổi ca giáo viên<br>- Portal Phụ Huynh xem bảng điểm | - Quản lý Lead tuyển sinh & Chăm sóc khách hàng<br>- Thu - Chi học phí, xuất phiếu thu A5<br>- Cổng thanh toán VietQR chuyển khoản<br>- Thống kê doanh thu theo cơ sở |
| **Đặc thù lỗi** | Thường nghẽn mạng vào giờ cao điểm điểm danh (18h-19h tối), lỗi font tiếng Việt trên app phụ huynh. | Lỗi tạo mã QR ngân hàng, sai sót đối soát số tiền, lỗi form nhập liệu khách hàng. |

---

## 2. Cơ chế Project Switcher Toàn Cục (Global Context)

### 2.1. Vị trí trên Header Navbar
- Nằm cố định trên thanh Navbar phía trên, bên cạnh thanh tìm kiếm và nút Tạo Ticket.
- Dropdown gồm 3 lựa chọn:
  1. `📁 Tất cả dự án (Tổng hợp)` - Code: `ALL`
  2. `🎓 Project 1: Học Vụ & LMS Học Viên` - Code: `LMS`
  3. `💼 Project 2: CRM Tuyển Sinh & Kế Toán Vận Hành` - Code: `CRM`

### 2.2. Lưu trữ trạng thái ngữ cảnh (State Persistence & Zustand Store)
- Sử dụng **Zustand Store (`useProjectStore`)** kết hợp **Cookie** `active_project`:
  - **Phía Client:** Các component Mantis (Header, Filter bar, Form modal) đọc và lắng nghe thay đổi từ `useProjectStore` của Zustand ngay lập tức mà không gây re-render toàn bộ cây DOM.
  - **Phía Server:** Đồng bộ song song qua Cookie `active_project` (hoặc URL query param) để Server Component trong Next.js 16.3.5 có thể đọc trực tiếp khi render trang.
- Khi người dùng chọn đổi Project:
  1. Gọi action Zustand `setActiveProject(newProject)`.
  2. Ghi Cookie `active_project`.
  3. Kích hoạt Server revalidation / router refresh để các Server Component fetch lại data tương ứng.
  4. Form tạo Ticket hoặc Task mới tự động lấy giá trị `activeProject` từ Zustand làm mặc định.

---

## 3. Kiến trúc Luồng Dữ Liệu Lọc Theo Project

```mermaid
flowchart LR
    A[User đổi Project Switcher: LMS] --> B[Lưu Cookie active_project=LMS]
    B --> C[Next.js Server Component load trang]
    C --> D{Kiểm tra giá trị Project}
    D -- ALL --> E[Query DB: tickets.findMany không điều kiện project]
    D -- LMS hoặc CRM --> F[Query DB: tickets.findMany where: { project: { code: 'LMS' } }]
    F --> G[Render bảng dữ liệu chỉ chứa Ticket/Task của LMS]
```

---

## 4. Giao diện & Trải nghiệm Người Dùng (UX)

- **Badge nhận diện màu sắc:**
  - `Project 1 (LMS)`: Gắn nhãn màu Indigo (`bg-indigo-50 text-indigo-700 border-indigo-200`).
  - `Project 2 (CRM)`: Gắn nhãn màu Amber/Emerald (`bg-amber-50 text-amber-700 border-amber-200`).
- **Trên Bảng Kanban:** Khi đang chọn chế độ `ALL`, mỗi Card công việc đều có huy hiệu góc trên bên trái thể hiện rõ thuộc Project nào để dev không bị nhầm lẫn.
- **Trên Form Báo Bug:** Luôn có 2 Radio Card to, trực quan cho phép người báo chọn rõ là hệ thống Học Vụ hay Vận Hành Kế Toán trước khi điền chi tiết lỗi.

---

## 5. Checklist Kiểm Thử & Triển Khai (DoD)

- [ ] Tạo dữ liệu seed gồm 2 record chuẩn trong bảng `Project`: `LMS` và `CRM`.
- [ ] Component `ProjectSwitcher` lưu giá trị vào Cookie và kích hoạt `router.refresh()`.
- [ ] Mọi Server Action và Route truy vấn dữ liệu (`getTickets`, `getTasks`, `getSprintMetrics`) đều nhận tham số lọc `projectCode`.
- [ ] Khi chọn 1 project cụ thể, không được hiển thị task/ticket của project còn lại.
