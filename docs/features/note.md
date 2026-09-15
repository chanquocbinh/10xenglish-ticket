Bản đặc tả kỹ thuật (Technical Specification) chi tiết cho tính năng **Personal & Private Note** trên nền tảng Next.js CMS Portal, áp dụng kiến trúc **Client-Side Key Derivation (Cách 2: Khóa mã hóa tạo từ Password/Salt hoặc Local Device Secret)**.

---

### 1. Kiến trúc Mã hóa & Bảo mật (Security Architecture)

Cơ chế đảm bảo Database Administrator, Super Admin hoặc bất kỳ ai can thiệp vào tầng Backend/Network đều chỉ thấy các khối chuỗi nhị phân mã hóa vô nghĩa.

```
[User Password / Client Salt] 
         │ (PBKDF2 - SHA-256)
         ▼
 [AES-GCM 256 CryptoKey] (Chỉ tồn tại trong bộ nhớ Browser)
         │
 ┌───────┴────────────────────────────────────────┐
 │ Frontend (Next.js Client)                      │
 │ Plaintext (JSON) ──(Encrypt)──► Ciphertext+IV  │
 └───────────────────────┬────────────────────────┘
                         │ HTTPS (Body: { encryptedData, iv })
                         ▼
┌─────────────────────────────────────────────────┐
│ Server & Database                               │
│ - Admin / Dev xem DB: Chỉ thấy Ciphertext & IV  │
│ - Không giữ Master Key, không thể Decrypt       │
└─────────────────────────────────────────────────┘

```

#### 1.1. Luồng dẫn xuất khóa (Key Derivation - Client Side)

* **Thuật toán sinh khóa:** Sử dụng chuẩn W3C Web Crypto API (`window.crypto.subtle`).
* **Quy trình:**
1. Khi user đăng nhập thành công, client lấy một chuỗi `encryption_salt` tĩnh gắn với tài khoản của user từ server (chỉ dùng làm muối, không phải secret).
2. Sử dụng `PBKDF2` với `SHA-256`, 100.000 iterations kết hợp giữa Password/Session Seed của user + `salt` để sinh ra một `CryptoKey` dạng **AES-GCM (256-bit)**.
3. `CryptoKey` này được lưu trên bộ nhớ RAM (React Context / In-memory state) hoặc `sessionStorage`. **Tuyệt đối không gửi khóa này lên bất kỳ API hay log nào**.



#### 1.2. Mã hóa & Giải mã nội dung

* **Mã hóa (Trước khi POST/PUT lên Server):**
* Nội dung (Rich text, Todo, Kanban) được chuyển thành JSON string.
* Tạo ngẫu nhiên một Vector khởi tạo: `iv = window.crypto.getRandomValues(new Uint8Array(12))`.
* Gọi `crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encodedData)`.
* Đóng gói thành chuỗi Base64: `encryptedContent` và `iv`.


* **Giải mã (Khi GET từ Server về Client):**
* Nhận `encryptedContent` và `iv` từ API.
* Gọi `crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipherData)`.
* Parse kết quả `utf-8` trở lại đối tượng JSON tương ứng của Note.



---

### 2. Thiết kế Cơ sở Dữ liệu (Prisma Schema)

Bảng dữ liệu tách biệt hoàn toàn giữa Metadata (phục vụ filter/sort) và Nội dung (mã hóa 100%).

```prisma
enum NoteType {
  DOCUMENT // Rich text note (H1-H3, formatting...)
  TODO     // Danh sách công việc checklist
  KANBAN   // Board cá nhân 3 cột
}

model PersonalNote {
  id               String   @id @default(uuid())
  userId           String   // Foreign key liên kết bảng User
  title            String   // Tiêu đề note (Hiển thị ở sidebar list)
  type             NoteType @default(DOCUMENT)
  
  // Dữ liệu mã hóa (Client-side Encrypted)
  encryptedContent String   @db.Text // Chuỗi Base64 của ciphertext
  iv               String   @db.VarChar(64) // Chuỗi Base64 của Initialization Vector

  isPinned         Boolean  @default(false)
  tags             String[] // Tag cá nhân để lọc
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, updatedAt(sort: Desc)])
  @@map("personal_notes")
}

```

---

### 3. Cấu trúc Payload Dữ liệu (JSON Schemas)

Trước khi mã hóa, cấu trúc nội dung của từng dạng Note được định nghĩa chuẩn:

#### 3.1. Dạng DOCUMENT (Rich Text)

Lưu trữ định dạng Tiptap JSON node:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "Kế hoạch tuần 40" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Cần hoàn tất fix bug " },
        { "type": "text", "marks": [{ "type": "bold" }], "text": "màn hình LMS" }
      ]
    }
  ]
}

```

#### 3.2. Dạng TODO (Personal Checklist)

```json
[
  {
    "id": "todo-1",
    "text": "Review log báo lỗi từ phòng Học vụ",
    "isCompleted": false,
    "priority": "P1",
    "createdAt": "2026-09-15T08:00:00.000Z"
  },
  {
    "id": "todo-2",
    "text": "Test lại luồng upload ảnh ticket",
    "isCompleted": true,
    "priority": "P2",
    "createdAt": "2026-09-15T09:30:00.000Z"
  }
]

```

#### 3.3. Dạng KANBAN (Personal Board)

Tương thích trực tiếp với cấu trúc kéo thả của `@hello-pangea/dnd` hoặc `@dnd-kit/core`:

```json
{
  "columns": {
    "col-todo": { "id": "col-todo", "title": "Cần làm", "taskIds": ["t-1", "t-2"] },
    "col-in-progress": { "id": "col-in-progress", "title": "Đang làm", "taskIds": ["t-3"] },
    "col-done": { "id": "col-done", "title": "Đã xong", "taskIds": [] }
  },
  "tasks": {
    "t-1": { "id": "t-1", "content": "Tối ưu câu query Prisma", "ticketRef": "TCK-104" },
    "t-2": { "id": "t-2", "content": "Soạn tài liệu UAT cho sếp", "ticketRef": null },
    "t-3": { "id": "t-3", "content": "Dựng layout trang Note", "ticketRef": null }
  },
  "columnOrder": ["col-todo", "col-in-progress", "col-done"]
}

```

---

### 4. API Endpoints & Ràng buộc Server-Side (Next.js Route Handlers)

Mọi API route đều chạy qua middleware xác thực session (NextAuth/Auth.js) và **buộc chặt** `userId = session.user.id`.

| Method | Endpoint | Mô tả | Payload / Request |
| --- | --- | --- | --- |
| `GET` | `/api/notes` | Lấy danh sách note của user (có phân trang) | Query: `?type=DOCUMENT&page=1` |
| `POST` | `/api/notes` | Tạo mới một note trống hoặc có nội dung | `{ title, type, encryptedContent, iv }` |
| `GET` | `/api/notes/[id]` | Lấy chi tiết note | Param: `id` (Chặn 404/403 nếu note không thuộc user) |
| `PUT` | `/api/notes/[id]` | Cập nhật nội dung note (Auto-save) | `{ title, encryptedContent, iv, isPinned }` |
| `DELETE` | `/api/notes/[id]` | Xóa note vĩnh viễn | Param: `id` |

*Ví dụ Route Handler kiểm soát quyền sở hữu:*

```typescript
// app/api/notes/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { title, encryptedContent, iv, isPinned } = await req.json();

  // Đảm bảo chỉ update bản ghi khớp cả id và userId của session
  const updatedNote = await prisma.personalNote.updateMany({
    where: {
      id: params.id,
      userId: session.user.id, // Ngăn ngừa can thiệp ID note của người khác
    },
    data: {
      title,
      encryptedContent,
      iv,
      isPinned,
    },
  });

  if (updatedNote.count === 0) {
    return new NextResponse("Forbidden or Not Found", { status: 404 });
  }

  return NextResponse.json({ success: true });
}

```

---

### 5. Client Implementation: Encryption Helper & Auto-Save Hook

Mã nguồn triển khai tầng xử lý mã hóa tại trình duyệt (`lib/crypto.ts`):

```typescript
// lib/crypto.ts
export async function deriveKey(secret: string, salt: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(data: object | string, key: CryptoKey) {
  const text = typeof data === "string" ? data : JSON.stringify(data);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return {
    encryptedContent: Buffer.from(ciphertext).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
  };
}

export async function decryptData(encryptedContentBase64: string, ivBase64: string, key: CryptoKey) {
  const ciphertext = Buffer.from(encryptedContentBase64, "base64");
  const iv = Buffer.from(ivBase64, "base64");

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  const text = new TextDecoder().decode(decrypted);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

```

---

### 6. Kiến trúc Component UI & Auto-Save

* **Editor Module:** Tiptap Editor cấu hình gói starter kit gồm Heading (H1, H2, H3), Bold, Italic, Underline, BulletList, TaskList (Checkbox).


* **Kanban Module:** Kéo thả linh hoạt thẻ giữa 3 cột; hỗ trợ thêm nút "Quick Pin Ticket" để chèn mã Ticket từ CMS vào thẻ công việc cá nhân.


* **Auto-save Hook (`useAutoSaveNote`):**
* Lắng nghe biến đổi state trong editor/kanban.
* Dùng `useDebounce` (1500ms) sau thay đổi cuối.
* Gọi `encryptData(state, cryptoKey)` -> Gửi payload mã hóa qua API PUT.
* Cập nhật badge trạng thái ở góc màn hình: *Đang lưu...* -> *Đã mã hóa và lưu an toàn*.