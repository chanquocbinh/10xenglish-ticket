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
  const lmsProject = await prisma.project.upsert({
    where: { code: 'LMS' },
    update: {},
    create: {
      code: 'LMS',
      name: 'Project 1: Học Vụ & LMS Học Viên',
      description: 'Hệ thống lớp học, ca dạy, điểm danh giáo viên, bài tập học viên, portal phụ huynh',
    },
  });

  const crmProject = await prisma.project.upsert({
    where: { code: 'CRM' },
    update: {},
    create: {
      code: 'CRM',
      name: 'Project 2: CRM Tuyển Sinh & Kế Toán Vận Hành',
      description: 'Quản lý lead tư vấn tuyển sinh, thu chi học phí, tích hợp VietQR và báo cáo',
    },
  });

  // 4. Super Admin Role (hệ thống, đầy đủ quyền, không thể sửa/xóa)
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {
      permissions: ['*'],
      isSystem: true,
    },
    create: {
      name: 'Super Admin',
      description: 'Toàn quyền quản trị hệ thống, không thể chỉnh sửa hoặc xóa',
      permissions: ['*'],
      isSystem: true,
    },
  });

  // 5. Super Admin User
  const devPassHash = await bcrypt.hash('Admin@123456', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'digihome' },
    update: { roleId: superAdminRole.id, defaultProjectId: lmsProject.id },
    create: {
      username: 'digihome',
      email: 'dev@10xenglish.edu.vn',
      fullName: 'Digihome Dev',
      passwordHash: devPassHash,
      isPasswordChanged: true,
      roleId: superAdminRole.id,
      departmentId: deptMap['IT_DEV'],
      defaultProjectId: lmsProject.id,
    },
  });

  // 6. Gán Super Admin làm Manager của cả 2 dự án hạt giống
  for (const projectId of [lmsProject.id, crmProject.id]) {
    await prisma.projectMember.upsert({
      where: { userId_projectId: { userId: adminUser.id, projectId } },
      update: { role: 'MANAGER' },
      create: { userId: adminUser.id, projectId, role: 'MANAGER' },
    });
  }

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
