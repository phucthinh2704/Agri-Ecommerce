<div align="center">

<h1>🌿 FarmFresh E-Commerce 🌿</h1>

<p>
Một nền tảng E-commerce Full-Stack hoàn chỉnh được xây dựng từ đầu với React, Node.js, Express, và MongoDB.
</p>

<p>
<img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=for-the-badge" alt="React 19">
<img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white&style=for-the-badge" alt="Node.js">
<img src="https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white&style=for-the-badge" alt="Express">
<img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white&style=for-the-badge" alt="MongoDB">
<img src="https://img.shields.io/badge/Redux-Toolkit-764ABC?logo=redux&logoColor=white&style=for-the-badge" alt="Redux">
<img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge" alt="Tailwind CSS">
</p>

<p>
<strong><a href="https://github.com/phucthinh2704/Agri-Ecommerce">🚀 Xem Live Demo</a></strong>
</p>

</div>

---

## ✨ Tính năng nổi bật

Dự án này được chia thành hai phần chính: Cổng thông tin cho người dùng và Bảng điều khiển cho Quản trị viên.

### 👤 Tính năng cho Người dùng (Client)

-   **Xác thực đầy đủ:** Đăng nhập, Đăng ký bằng Email/Mật khẩu (có mã hóa `bcrypt`) và đăng nhập bằng **Google OAuth 2.0**.
-   **Hệ thống JWT:** Bảo mật bằng Access Token và Refresh Token.
-   **Tìm kiếm thông minh:** Thanh tìm kiếm với **debounce** (trì hoãn 300ms) tự động gọi API và hiển thị gợi ý sản phẩm.
-   **Quản lý Giỏ hàng:** Thêm, sửa, xóa sản phẩm trong giỏ hàng (quản lý state bằng **Redux Toolkit**).
-   **Thanh toán Quốc tế:** Tích hợp thanh toán an toàn qua **PayPal Sandbox**.
-   **Duyệt sản phẩm:** Lọc (theo danh mục), Sắp xếp (theo giá, tên, mới nhất), và **Phân trang** (Pagination).
-   **Trang cá nhân:** Người dùng có thể xem lại **Lịch sử đơn hàng** và **Cập nhật thông tin cá nhân** (tên, SĐT, địa chỉ, avatar) qua một Modal tiện lợi.
-   **Giao diện động:** Tự động cuộn lên đầu trang khi chuyển route (`ScrollToTop`) và nút bấm cuộn lên đầu (`ScrollToTopButton`).

### 👨‍💻 Tính năng cho Quản trị viên (Admin Panel)

-   **Route bảo vệ:** Phân quyền nghiêm ngặt, chỉ `role: "admin"` mới có thể truy cập.
-   **Dashboard Thống kê:**
    -   Hiển thị tổng quan (Doanh thu, Đơn hàng, Sản phẩm, Người dùng).
    -   **Biểu đồ đường (Recharts)** lọc doanh thu theo Ngày / Tuần / Tháng.
    -   **Biểu đồ cột (Recharts)** hiển thị Top 5 sản phẩm bán chạy nhất.
-   **Quản lý Sản phẩm (CRUD):**
    -   Tạo sản phẩm mới với trình soạn thảo **CKEditor 5** (Rich Text Editor).
    -   Upload nhiều ảnh (tối đa 5) trực tiếp lên **Cloudinary**.
    -   Cập nhật thông tin và quản lý ảnh (thêm/xóa ảnh cũ).
    -   Xóa sản phẩm (có popup xác nhận).
-   **Quản lý Đơn hàng (CRUD):**
    -   Lọc, tìm kiếm, và phân trang tất cả đơn hàng.
    -   Xem chi tiết đơn hàng trong Modal.
    -   **Cập nhật trạng thái** đơn hàng (Pending -> Shipping -> Completed).
-   **Quản lý Danh mục (CRUD):**
    -   Tạo, sửa, xóa danh mục.
    -   Upload ảnh đại diện cho danh mục.
-   **Quản lý Người dùng (CRUD):**
    -   Xem, lọc, và phân trang tất cả người dùng.
    -   **Thay đổi vai trò** (Role) của người dùng (ví dụ: customer -> admin).
    -   Xóa người dùng (có xác nhận).

---

## 🛠️ Công nghệ sử dụng

| Phân loại             | Công nghệ                                                                                                 |
| :-------------------- | :-------------------------------------------------------------------------------------------------------- |
| **Frontend**          | React 19, React Router v6, Redux Toolkit (với `redux-persist`), Tailwind CSS, Axios, Recharts, CKEditor 5 |
| **Backend**           | Node.js, Express.js, MongoDB (với `mongoose`), `async-handler`                                            |
| **Bảo mật & Auth**    | JWT (Access/Refresh Tokens), `bcrypt.js`, Google OAuth 2.0, Middleware (isAdmin, verifyToken)             |
| **File & Thanh toán** | Cloudinary (Upload ảnh), Multer, PayPal (react-paypal-js)                                                 |
| **Tooling**           | Vite, Nodemon                                                                                             |

---

## 🚀 Hướng dẫn cài đặt

Để chạy dự án này trên máy local của bạn, hãy làm theo các bước sau:

### 1. Clone dự án

```bash
git clone https://github.com/phucthinh2704/Agri-Ecommerce.git
cd Agri-Ecommerce
```

### 2. Cài đặt Backend (Thư mục `server`)

1.  **Đi đến thư mục server:**
    ```bash
    cd server
    ```
2.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```
3.  **Tạo file `.env`** ở trong thư mục `server` và thêm các biến môi trường:

    ```env
    # Server
    PORT=5000

    # MongoDB
    MONGODB_URI=your_mongodb_connection_string

    # JWT
    JWT_SECRET=your_jwt_secret_key

    # Google OAuth (Lấy từ Google Cloud Console)
    GOOGLE_CLIENT_ID=your_google_client_id

    # Cloudinary (Lấy từ Dashboard Cloudinary)
    CLOUDINARY_NAME=your_cloudinary_name
    CLOUDINARY_KEY=your_cloudinary_key
    CLOUDINARY_SECRET=your_cloudinary_secret
    CLOUDINARY_FOLDER=farmfresh

    # Tùy chọn (Nếu có)
    SHIPPING_FEE=30000
    FREE_SHIP_THRESHOLD=300000
    ```

4.  **Chạy server:**
    ```bash
    npm run dev
    ```

### 3. Cài đặt Frontend (Thư mục `client`)

1.  **Mở terminal mới, đi đến thư mục client:**
    ```bash
    cd client
    ```
2.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```
3.  **Tạo file `.env`** ở trong thư mục `client` và thêm các biến:

    ```env
    # URL trỏ đến backend của bạn
    VITE_API_URL=http://localhost:5000

    # Lấy từ Google Cloud Console (GIỐNG HỆT backend)
    VITE_GOOGLE_CLIENT_ID=your_google_client_id

    # Lấy từ PayPal Developer Dashboard (Tài khoản Sandbox)
    VITE_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
    ```

4.  **Chạy client (React):**
    ```bash
    npm run dev
    ```

Bây giờ, ứng dụng của bạn sẽ chạy tại `http://localhost:5173` (hoặc cổng Vite mặc định của bạn).

---

## 📄 Giấy phép

Dự án này được cấp phép theo Giấy phép MIT.
