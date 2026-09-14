import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding initial database records...');

  // 1. System Setting
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      allowedFileTypes: 'image/png,image/jpeg,image/webp,video/mp4,video/quicktime',
      maxImageSizeMb: 10,
      maxVideoSizeMb: 50,
      allowVideoUpload: true,
      storageQuotaGb: 20,
      defaultUserPassword: '10xEnglish@2026',
    },
  });

  // 2. Departments
  const departments = [
    { name: 'Học vụ & Đào tạo (LMS)', code: 'LMS_ACADEMIC' },
    { name: 'Tư vấn & Tuyển sinh (CRM)', code: 'CRM_SALES' },
    { name: 'Tài chính & Kế toán', code: 'FINANCE' },
    { name: 'Chăm sóc Học viên & Phụ huynh', code: 'STUDENT_CARE' },
    { name: 'Công nghệ thông tin (IT/Dev)', code: 'IT_DEV' },
    { name: 'Ban Giám Đốc (BOD)', code: 'BOD' },
  ];

  const deptMap: Record<string, string> = {};
  for (const d of departments) {
    const record = await prisma.department.upsert({
      where: { code: d.code },
      update: { name: d.name },
      create: { name: d.name, code: d.code },
    });
    deptMap[d.code] = record.id;
  }

  // 3. Projects
  const projectLMS = await prisma.project.upsert({
    where: { code: 'LMS' },
    update: {},
    create: {
      code: 'LMS',
      name: 'Project 1: Học Vụ & LMS Học Viên',
      description: 'Hệ thống lớp học, ca dạy, điểm danh giáo viên, bài tập học viên, portal phụ huynh',
    },
  });

  const projectCRM = await prisma.project.upsert({
    where: { code: 'CRM' },
    update: {},
    create: {
      code: 'CRM',
      name: 'Project 2: CRM Tuyển Sinh & Kế Toán Vận Hành',
      description: 'Quản lý lead tư vấn tuyển sinh, thu chi học phí, tích hợp VietQR và báo cáo',
    },
  });

  // 4. Default Password Hash
  const defaultPassHash = await bcrypt.hash('10xEnglish@2026', 10);
  const devPassHash = await bcrypt.hash('Admin@123456', 10);

  // 5. Users
  const devUser = await prisma.user.upsert({
    where: { username: 'digihome' },
    update: {},
    create: {
      username: 'digihome',
      email: 'dev@10xenglish.edu.vn',
      fullName: 'Digihome Dev',
      passwordHash: devPassHash,
      isPasswordChanged: true,
      role: 'DEV_ADMIN',
      departmentId: deptMap['IT_DEV'],
    },
  });

  const bossUser = await prisma.user.upsert({
    where: { username: 'tuan.ceo' },
    update: {},
    create: {
      username: 'tuan.ceo',
      email: 'ceo@10xenglish.edu.vn',
      fullName: 'Sếp Tuấn (CEO)',
      passwordHash: defaultPassHash,
      isPasswordChanged: true,
      role: 'MANAGER',
      departmentId: deptMap['BOD'],
    },
  });

  const teacherLead = await prisma.user.upsert({
    where: { username: 'huong.lms' },
    update: {},
    create: {
      username: 'huong.lms',
      email: 'lanhuong.academic@10xenglish.edu.vn',
      fullName: 'Cô Lan Hương (Lead LMS)',
      passwordHash: defaultPassHash,
      isPasswordChanged: true,
      role: 'LEAD_STAFF',
      departmentId: deptMap['LMS_ACADEMIC'],
    },
  });

  const accountantUser = await prisma.user.upsert({
    where: { username: 'maianh.acc' },
    update: {},
    create: {
      username: 'maianh.acc',
      email: 'maianh.ketoan@10xenglish.edu.vn',
      fullName: 'Mai Anh Kế Toán',
      passwordHash: defaultPassHash,
      isPasswordChanged: false, // Buộc đổi pass khi login
      role: 'STAFF',
      departmentId: deptMap['FINANCE'],
    },
  });

  // 6. Sprint 14
  const sprintLMS = await prisma.sprint.upsert({
    where: { id: 'sprint-14-lms' },
    update: {},
    create: {
      id: 'sprint-14-lms',
      name: 'Sprint 14: Điểm danh & Cổng thanh toán Q3',
      goal: 'Đảm bảo giáo viên điểm danh không bị timeout lúc 18h + Tích hợp luồng VietQR',
      projectId: projectLMS.id,
      startDate: new Date('2026-09-08'),
      endDate: new Date('2026-09-19'),
      capacitySp: 24,
      isCurrent: true,
    },
  });

  // 7. Seed Tickets
  await prisma.ticket.upsert({
    where: { ticketNumber: 108 },
    update: {},
    create: {
      ticketNumber: 108,
      title: 'Giáo viên bấm Điểm Danh bị quay vô tận lúc 18h tối',
      projectId: projectLMS.id,
      submodule: 'LMS: Điểm danh & Sĩ số lớp',
      affectedRole: 'Giáo viên (Teacher)',
      severity: 'BLOCKER',
      status: 'RESOLVED',
      description: '1. Đăng nhập tài khoản GV Lan Hương\n2. Vào lớp IELTS 6.5 lúc 18:00\n3. Bấm Lưu sĩ số thì màn hình xoay vô tận',
      evidenceUrls: [],
      reporterId: teacherLead.id,
    },
  });

  await prisma.ticket.upsert({
    where: { ticketNumber: 109 },
    update: {},
    create: {
      ticketNumber: 109,
      title: 'Không tạo được mã VietQR chuyển khoản học phí cho học viên có dấu',
      projectId: projectCRM.id,
      submodule: 'Kế toán: Thu học phí & Xuất biên lai A5',
      affectedRole: 'Kế toán',
      severity: 'HIGH',
      status: 'IN_PROGRESS',
      description: 'Cú pháp VietQR bị lỗi font UTF-8 khi tên học viên có dấu phức tạp',
      evidenceUrls: [],
      reporterId: accountantUser.id,
    },
  });

  // 8. Seed Tasks
  await prisma.task.upsert({
    where: { id: 'task-101' },
    update: {},
    create: {
      id: 'task-101',
      title: 'Tối ưu query thống kê doanh thu theo cơ sở',
      projectId: projectCRM.id,
      sprintId: sprintLMS.id,
      type: 'PLANNED',
      status: 'TODO',
      storyPoints: 4,
      assigneeId: devUser.id,
      checklists: [
        { title: 'Tạo index trên bảng invoice', completed: false },
        { title: 'Test tải với 100,000 hóa đơn', completed: false },
      ],
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-102' },
    update: {},
    create: {
      id: 'task-102',
      title: 'Fix lỗi lag giật & timeout trang Điểm Danh LMS lúc 18h',
      projectId: projectLMS.id,
      sprintId: sprintLMS.id,
      type: 'PLANNED',
      status: 'PENDING_APPROVAL',
      storyPoints: 5,
      assigneeId: devUser.id,
      checklists: [
        { title: 'Tối ưu batch update SQL', completed: true },
        { title: 'Thêm Redis cache sĩ số', completed: true },
      ],
    },
  });

  // 9. Seed Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: bossUser.id,
      action: 'APPROVE_SIGNOFF',
      detail: 'Sếp Tuấn đã phê duyệt nghiệm thu tính năng: Xuất phiếu thu học phí A5 có mã barcode',
    },
  });

  console.log('✅ Seed dữ liệu khởi tạo thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
