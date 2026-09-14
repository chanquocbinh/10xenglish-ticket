# Module 07: Dashboard Chỉ Số & Báo Cáo Tự Động (Executive Summary)

Tài liệu này đặc tả màn hình Dashboard tổng quan, các chỉ số đo lường hiệu suất sprint, tỷ lệ bug tồn đọng và tính năng xuất báo cáo gửi Sếp trước cuộc họp tuần.

---

## 1. Yêu cầu nghiệp vụ

1. **Minh chứng kết quả làm việc thực tế:** Cung cấp số liệu chính xác để Sếp thấy rõ tuần này Dev đã hoàn thành những gì, bao nhiêu task bị phát sinh do sếp yêu cầu thêm và tình trạng bug của từng phân hệ.
2. **Theo dõi theo ngữ cảnh:**
   - Khi chọn `ALL`: Thống kê gộp toàn bộ trung tâm.
   - Khi chọn `Project 1 (LMS)`: Thống kê riêng cho khối Học Vụ.
   - Khi chọn `Project 2 (CRM)`: Thống kê riêng cho khối Tuyển Sinh & Kế Toán.
3. **Xuất báo cáo (Export/Share):**
   - Hỗ trợ xuất file PDF tóm tắt hoặc tạo link xem nhanh (Read-only Share Link) để gửi vào nhóm Zalo ban giám đốc trước mỗi buổi họp giao ban sáng thứ Hai.

---

## 2. Các Chỉ Số Đo Lường Chính (Key Metrics)

| Chỉ số | Cách tính toán | Ý nghĩa quản lý |
| --- | --- | --- |
| **Bug Tồn Đọng** | Số lượng Ticket trạng thái `NEW` + `IN_PROGRESS` | Cảnh báo mức độ nghẽn mạng hoặc lỗi chưa được xử lý. Cảnh báo đỏ nếu có bug `BLOCKER`. |
| **Tiến Độ Sprint** | `(Story Points Đã Xong / Tổng Story Points Cam Kết) * 100%` | Đánh giá khả năng hoàn thành mục tiêu đúng hạn kết thúc Sprint. |
| **Thời Gian Fix TB** | Trung bình thời gian từ khi ticket tạo đến khi chuyển `RESOLVED` (giờ) | Đo lường tốc độ phản ứng kỹ thuật của Dev. |
| **Chờ Sếp Nghiệm Thu** | Số task/ticket đang ở cột `PENDING_APPROVAL` | Nhắc nhở Sếp cần vào phòng nghiệm thu để test UAT và bấm ký duyệt. |

---

## 3. Giao diện Dashboard (Mantis Style)

Route: `/` (Trang chủ sau khi đăng nhập)

### 3.1. 4 Khối Thẻ Thống Kê (Top Stat Cards)
- **Card 1: Bug Tồn Đọng** - Số to màu đỏ `4 / 18 tuần này`, có cảnh báo `"1 bug Blocker cần duyệt gấp"`.
- **Card 2: Tiến Độ Sprint 14** - Số to màu tím `78%`, icon tăng trưởng màu xanh lá `"Đúng hạn kết thúc Thứ 6"`.
- **Card 3: Thời Gian Fix TB** - Số to `3.5 giờ`, giảm 24% so với tuần trước.
- **Card 4: Chờ Sếp Nghiệm Thu** - Số to màu hổ phách `2 task`, nhắc nhở cần sign-off.

### 3.2. Tiến Độ Khối Lượng Hoàn Thành Theo Phân Hệ (Module Progress Bars)
- Biểu đồ thanh ngang so sánh tỷ lệ hoàn thành của các phân hệ:
  - `LMS & Điểm Danh Giáo Viên`: 5/6 Tasks (83%)
  - `CRM Tư Vấn Tuyển Sinh`: 4/4 Tasks (100% Hoàn thành)
  - `Kế Toán & Đóng Học Phí`: 2/4 Tasks (50%)
  - `Portal Phụ Huynh`: 1/3 Tasks (33%)

### 3.3. Mục Tiêu Sprint (Sprint Goal Callout)
- Hộp thông tin màu tím nhạt có icon mục tiêu:
  > *"Sprint Goal (Sprint 14): Đảm bảo giáo viên chấm điểm danh không bị timeout lúc 18h tối + Tích hợp xong luồng hoàn trả học phí tự động."*

### 3.4. Bảng Dòng Thời Gian Lưu Vết (Real-time Audit Log Widget)
- Widget tóm tắt 3-5 sự kiện nghiệm thu mới nhất:
  - `Sếp Tuấn (CEO)` đã chấp thuận nghiệm thu tính năng xuất phiếu thu PDF (14:20).
  - `Sếp Tuấn (CEO)` yêu cầu thêm task mới và bù trừ 1 task khác ra khỏi tuần này (Hôm qua 16:45).
  - `Dev Digihome` chuyển trạng thái bug #TK-108 sang Đã fix (Hôm qua 11:30).

---

## 4. Tính Năng Xuất Báo Cáo (Export Report)

- **API Route:** `GET /api/reports/sprint-summary?sprintId=...&format=pdf`
- **Nội dung bản báo cáo tuần xuất ra:**
  1. Header: Logo 10X English + Tên Sprint + Ngày báo cáo.
  2. Tóm tắt chỉ số KPI chính.
  3. Danh sách các tính năng và Bug đã được **Sếp ký duyệt nghiệm thu thành công** (Kèm thời gian ký).
  4. Danh sách các yêu cầu phát sinh đột xuất trong tuần (nếu có).
  5. Kế hoạch dự kiến cho Sprint tiếp theo.

---

## 5. Checklist Kiểm Thử & Triển Khai (DoD)

- [ ] Toàn bộ số liệu trên Dashboard tự động cập nhật lại khi người dùng đổi `Project Switcher` từ Header.
- [ ] Truy vấn database tối ưu hóa bằng Prisma `count()` và `aggregate()`, không kéo toàn bộ bảng về bộ nhớ để tính toán.
- [ ] Nút "Xuất PDF / Link Sếp" sinh link chia sẻ bảo mật có thời hạn hoặc kích hoạt in trình duyệt (Print CSS).
