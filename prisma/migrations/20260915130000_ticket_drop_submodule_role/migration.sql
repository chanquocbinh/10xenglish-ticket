-- Đơn giản hoá ticket: bỏ trường phân hệ con và tài khoản gặp lỗi
ALTER TABLE "Ticket" DROP COLUMN "submodule";
ALTER TABLE "Ticket" DROP COLUMN "affectedRole";
