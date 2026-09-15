/** Năng lực tải mặc định khi sprint chưa cấu hình capacity. */
export const DEFAULT_SPRINT_CAPACITY_SP = 24;

/** Vượt ngưỡng phần trăm này thì báo động sprint quá tải. */
export const SPRINT_CAPACITY_ALERT_PERCENT = 85;

export interface RoadmapMilestone {
  period: string;
  title: string;
  description: string;
  /** Mốc đang triển khai: tô màu chủ đạo. */
  isCurrent?: boolean;
}

/** Lộ trình phát hành hiển thị ở khối Roadmap. */
export const ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    period: 'THÁNG 9 / 2026 (HIỆN TẠI)',
    title: 'Sprint 14: Điểm danh & Cổng thanh toán',
    description: 'Giải quyết dứt điểm nghẽn mạng lúc 18h tối',
    isCurrent: true,
  },
  {
    period: 'THÁNG 10 / 2026',
    title: 'Sprint 15: Tuyển sinh khóa mới & Chia lớp',
    description: 'Tự động phân ca học viên theo kết quả test',
  },
  {
    period: 'QUÝ 4 / 2026',
    title: 'Sprint 16: AI Chấm phát âm Speaking',
    description: 'Tích hợp OpenAI Whisper kiểm tra âm đuôi',
  },
];
