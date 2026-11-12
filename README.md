# Katalog Kantin — Backend API

REST API untuk katalog warung kantin, autentikasi, dan pengelolaan warung. Backend menggunakan Express 5, TypeScript, Drizzle ORM, dan Microsoft SQL Server.

## Teknologi

- Node.js dan TypeScript
- Express 5
- Drizzle ORM dengan driver Microsoft SQL Server
- JWT (`jsonwebtoken`) dan bcrypt (`bcryptjs`)
- Zod untuk validasi request
- OpenAPI dan Swagger UI

## Fitur dan akses

- Registrasi publik membuat akun dengan role `customer`.
- Login menghasilkan JWT; endpoint terproteksi menerima token melalui header `Authorization: Bearer <token>`.
- Daftar warung mendukung pencarian, filter kategori, dan pagination.
- Filter `Makanan` mengelompokkan Makanan, Nasi, Kwetiau/Kwetiaw, Bakso, Soto, Western, dan Sate. Filter `Snack` juga mencakup Camilan.
- Owner dan admin dapat menambah warung. Owner hanya dapat mengubah warung miliknya, sedangkan admin dapat mengubah atau menghapus warung mana pun.
- Pengguna yang sudah login dapat mengirim ulasan dengan rating 1–5.

## Persiapan dan konfigurasi

Pastikan Node.js, npm, dan SQL Server tersedia. Buat database dan tabel yang dibutuhkan aplikasi sebelum menjalankan API; proyek ini belum menyediakan perintah migrasi atau seed database.

Salin `.env.example` menjadi `.env` di direktori proyek, lalu isi nilai sesuai lingkungan lokal:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=review_kantin

DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1h
```

Jangan gunakan contoh nilai rahasia di atas sebagai kredensial produksi dan jangan commit file `.env`.

## Menjalankan API

```powershell
cd "D:\Semester 3\P RSI\Kumpulan_Tugas_RSI\tugas4-ReviewKantin-api"
npm install
npm run dev
```

Server berjalan pada `http://localhost:3000`. Perintah `npm start` menjalankan server tanpa mode watch.

| URL | Kegunaan |
|---|---|
| `http://localhost:3000/health` | Memeriksa koneksi server dan database |
| `http://localhost:3000/docs` | Dokumentasi interaktif Swagger |
| `http://localhost:3000/api/v1` | Prefix endpoint API |

## Endpoint

Semua endpoint berikut memakai prefix `/api/v1`.

### Autentikasi

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `POST` | `/auth/register` | Publik | Registrasi akun customer |
| `POST` | `/auth/login` | Publik | Login dan memperoleh JWT |
| `GET` | `/auth/me` | Login | Mendapatkan profil akun dari token |

### Warung dan ulasan

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `GET` | `/stalls?search=&category=&page=&limit=` | Publik | Daftar warung, pencarian, filter, dan pagination |
| `GET` | `/stalls/:id` | Publik | Detail warung |
| `GET` | `/stalls/:id/menus` | Publik | Daftar menu warung |
| `POST` | `/stalls` | Owner, admin | Membuat warung; owner ID diambil dari token |
| `PUT` | `/stalls/:id` | Owner pemilik, admin | Mengubah warung |
| `DELETE` | `/stalls/:id` | Admin | Menghapus warung |
| `POST` | `/stalls/:id/reviews` | Login | Mengirim ulasan dengan rating 1–5 |

`limit` maksimal 100. Query filter kategori `Makanan` dan `Snack` mengikuti pengelompokan yang dijelaskan pada bagian fitur.
