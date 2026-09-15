export interface ModuleProgress {
  label: string;
  /** Phần trăm hoàn thành hiển thị trên thanh tiến độ. */
  value: number;
  statusLabel: string;
  color: 'primary' | 'success' | 'warning';
}

/** Tiến độ theo phân hệ nghiệp vụ (số liệu nghiệm thu chốt với sếp). */
export const MODULE_PROGRESS: ModuleProgress[] = [
  {
    label: 'LMS & Điểm Danh Giáo Viên (Project 1)',
    value: 85,
    statusLabel: '85% Hoàn Thành',
    color: 'primary',
  },
  {
    label: 'CRM Tư Vấn & Tuyển Sinh (Project 2)',
    value: 100,
    statusLabel: '100% Hoàn Thành',
    color: 'success',
  },
  {
    label: 'Kế Toán Học Phí & VietQR (Project 2)',
    value: 50,
    statusLabel: '50% Đang Test API',
    color: 'warning',
  },
];
