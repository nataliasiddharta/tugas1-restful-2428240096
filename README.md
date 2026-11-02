---

## 🧠 Konsep Dasar: Embedding vs Referencing (Bekal Ujian)

Untuk menjawab soal studi kasus perancangan database NoSQL, gunakan aturan sederhana ini:

### 1. Kapan Memilih EMBEDDING? (Data Ditanam di Dalam)
* **Konsep:** Data anak disimpan langsung di dalam satu dokumen induk.
* **Kapan Dipakai:** 
  * Hubungan *One-to-Few* (1 induk punya sedikit data anak).
  * Data tersebut **tidak berdiri sendiri** dan selalu diakses barengan dengan data induk.
* **Contoh di Kasus Kita:** **Jadwal Kuliah**
  * *Alasan:* Jadwal kuliah ("Senin jam 08:00 di Lab 3") tidak ada artinya jika tidak ada mata kuliahnya. Jumlah jadwal untuk 1 matkul juga sedikit (paling 1-2 jadwal), jadi lebih cepat dan efisien jika **ditanam (embed)** langsung di dalam matkul.
* **Studi Kasus Lain di Ujian:**
  * Alamat pengiriman di profil Pengguna (User).
  * Detail barang/item di dalam sebuah Struk Pesanan (Order).

---

### 2. Kapan Memilih REFERENCING? (Data Dipisah & Dihubungkan via ID)
* **Konsep:** Data disimpan di koleksi/tabel terpisah, dokumen induk hanya menyimpan nomor ID (`ObjectId`) dari dokumen target.
* **Kapan Dipakai:**
  * Hubungan *One-to-Many* atau *Many-to-Many* yang besar/berulang.
  * Data target adalah **entitas mandiri** yang bisa mengajar/berelasi dengan banyak dokumen lain.
* **Contoh di Kasus Kita:** **Dosen Pengampu**
  * *Alasan:* Dosen adalah entitas mandiri yang punya NIDN dan data pribadi. 1 Dosen bisa mengajar 5 mata kuliah berbeda. Kalau di-embed, data dosen akan terduplikasi di 5 tempat berbeda. Maka Dosen **dipisah (reference)**, dan di matkul cukup catat ID dosennya saja.
* **Studi Kasus Lain di Ujian:**
  * Kategori buku di Perpustakaan (1 Kategori punya ribuan buku).
  * Dokter di Rumah Sakit (1 Dokter menangani banyak rekam medis pasien).

---

### 3. Apa itu `.populate()`?
Di MongoDB, tidak ada perintah SQL `JOIN`. Sebagai gantinya, Mongoose menyediakan fungsi `.populate('dosenPengampu')`.
* **Fungsi:** Mengambil ID yang tersimpan di field `dosenPengampu`, lalu secara otomatis pergi ke koleksi Dosen untuk menukar ID tersebut dengan data asli dosen (nama, nidn, email) saat ditampilkan ke klien.



```markdown
# 📚 Dokumentasi Lengkap Praktikum: RESTful API Express.js & MongoDB
### Implementasi Data Modeling (Embedding & Referencing) serta Advanced Querying (Filtering, Sorting, Projection, Pagination)

* **Nama:** Natalia Siddharta
* **NIM:** 2428240096
* **Program Studi:** Sistem Informasi
* **Mata Kuliah:** Pengembangan Aplikasi Web II
* **Dosen Pengampu:** Nur Rachmat, M.Kom.
* **Topik Penugasan:** 4 - Akademik (Mata Kuliah & Dosen)
* **Repository Tugas:** [https://github.com/nataliasiddharta/tugas1-restful-2428240096](https://github.com/nataliasiddharta/tugas1-restful-2428240096)

---

## 📑 DAFTAR ISI
1. [Deskripsi & Tujuan Penugasan](#1-deskripsi--tujuan-penugasan)
2. [Langkah demi Langkah Setup MongoDB Atlas (Cloud)](#2-langkah-demi-langkah-setup-mongodb-atlas-cloud)
3. [Mengambil Connection String: Otomatis vs Manual (Legacy URI)](#3-mengambil-connection-string-otomatis-vs-manual-legacy-uri)
4. [Langkah demi Langkah Menghubungkan ke MongoDB Compass (GUI)](#4-langkah-demi-langkah-menghubungkan-ke-mongodb-compass-gui)
5. [Langkah Integrasi Project Express.js (VS Code & Dependencies)](#5-langkah-integrasi-project-expressjs-vs-code--dependencies)
6. [Daftar Error Nyata yang Dialami & Cara Mengatasinya](#6-daftar-error-nyata-yang-dialami--cara-mengatasinya)
7. [Struktur Kode Lengkap (app.js)](#7-struktur-kode-lengkap-appjs)
8. [Panduan Pengujian Postman Lengkap dengan Format Body JSON](#8-panduan-pengujian-postman-lengkap-dengan-format-body-json)
9. [Bukti Pengujian (Screenshots Hasil Postman)](#9-bukti-pengujian-screenshots-hasil-postman)

---

## 1. Deskripsi & Tujuan Penugasan
Pada penugasan ini, mahasiswa diminta melakukan migrasi penyimpanan data dari yang sebelumnya berbasis in-memory array JavaScript menjadi tersimpan permanen di database NoSQL **MongoDB** melalui ODM **Mongoose**.

Tujuan teknis penugasan meliputi:
1. **Referencing (Normalisasi):** Menghubungkan koleksi `courses` (Mata Kuliah) dengan koleksi `dosens` (Dosen) melalui field `dosenPengampu` bertipe `mongoose.Schema.Types.ObjectId`, dan menampilkannya secara utuh menggunakan fungsi `.populate()`.
2. **Embedding (Denormalisasi):** Menanamkan sub-dokumen `jadwal` (hari, jamMulai, jamSelesai, ruangan) langsung sebagai array di dalam dokumen Mata Kuliah.
3. **Advanced Querying pada Endpoint Utama (`GET /courses`):**
   * **Filtering:** Menyaring mata kuliah berdasarkan semester tertentu (misal: `?semester=3`).
   * **Sorting:** Mengurutkan mata kuliah berdasarkan jumlah SKS secara descending (misal: `?sort=-sks`).
   * **Projection:** Menampilkan hanya field tertentu saja yang diminta klien (misal: `?fields=kode,namaMatkul`).
   * **Pagination:** Membatasi jumlah data per halaman dan menghitung total halaman (misal: `?page=1&limit=1`).

---

## 2. Langkah demi Langkah Setup MongoDB Atlas (Cloud)

### A. Registrasi Akun & Pembuatan Cluster Gratis
1. Buka browser dan kunjungi **[cloud.mongodb.com](https://cloud.mongodb.com)**.
2. Login menggunakan akun Google.
3. Pada halaman dashboard, pilih paket **M0 (FREE)**.
4. Pilih Cloud Provider **AWS** dan pilih region terdekat: **Singapore (`ap-southeast-1`)**.
5. Beri nama cluster (default: `Cluster0`), lalu klik **Create Deployment**.

### B. Membuat User Database & Password
1. Di bagian Security, buat **Database Username**: `nataliasiddharta965_db_user`.
2. Buat password alfanumerik yang mudah diingat tanpa simbol pemisah URL seperti `@`, `:`, `/`, `?` (misal: `NataliaSiddharta2026`).
3. Klik **Create Database User**.

> 💡 **Cara Mengganti Password jika Lupa / Ingin Diubah:**
> * Klik menu **Database Access** di panel sebelah kiri (kategori SECURITY).
> * Cari user `nataliasiddharta965_db_user`, klik tombol **Edit** di sebelah kanan.
> * Pilih opsi **Edit Password**, ketik password baru alfanumerik yang bersih, lalu klik tombol hijau **Update User**.

### C. Mengatur Hak Akses Jaringan (Network Access IP Whitelist)
1. Di panel menu kiri, klik **Network Access**.
2. Klik tombol hijau **Add IP Address**.
3. Pilih opsi **Allow Access from Anywhere** (otomatis mengisi IP `0.0.0.0/0`).
4. Klik **Confirm**. Hal ini memastikan laptop dapat tersambung meskipun berganti jaringan WiFi atau tethering HP.

---

## 3. Mengambil Connection String: Otomatis vs Manual (Legacy URI)

Setelah cluster dan user siap, kita mengambil link koneksi dari tombol **Connect**:

### A. Pilihan Driver
1. Di pop-up Connect, klik opsi pertama: **Drivers and Client Libraries**.
2. Sistem otomatis memilih:
   * **Language:** `JavaScript`
   * **Client Library:** `Node.js Driver`

### B. Perbedaan Cara Otomatis vs Cara Manual (Centang Toggle Legacy URI)
* **Cara Otomatis (Default Driver Modern):**
  Atlas memberikan connection string dengan format SRV:
  ```text
  mongodb+srv://nataliasiddharta965_db_user:<db_password>@cluster0.a4nzzxf.mongodb.net/
  ```
  *Kelemahan:* Di beberapa jaringan internet/WiFi Indonesia, domain `+srv` sering mengalami kendala timeout atau `querySrv ECONNREFUSED` karena DNS ISP lokal.
* **Cara Manual (Mengaktifkan Toggle Switch Legacy URI):**
  1. Di bawah dropdown driver, perhatikan saklar toggle bertuliskan **`Legacy URI String`**.
  2. **Aktifkan saklar toggle `Legacy URI String` tersebut (di-centang/di-klik ON)**.
  3. Atau ubah versi driver ke `2.2.12 or later`.
  4. Format link koneksi otomatis berubah menjadi link standar tanpa `+srv`:
     ```text
     mongodb://nataliasiddharta965_db_user:<db_password>@ac-kdoo6ho-shard-00-00.a4nzzxf.mongodb.net:27017,ac-kdoo6ho-shard-00-01.a4nzzxf.mongodb.net:27017,ac-kdoo6ho-shard-00-02.a4nzzxf.mongodb.net:27017/?ssl=true&replicaSet=atlas-heo76x-shard-0&authSource=admin
     ```
  5. Salin link manual ini. Link ini jauh lebih stabil dan tidak pernah gagal dibaca oleh DNS jaringan manapun.

---

## 4. Langkah demi Langkah Menghubungkan ke MongoDB Compass (GUI)

MongoDB Compass digunakan untuk melihat isi koleksi dan dokumen database secara visual dari laptop:

1. Buka aplikasi **MongoDB Compass**.
2. **Jika Link Tidak Terdeteksi Otomatis:**
   * Di atas kolom input URI, cari tulisan **"Edit Connection String"** yang memiliki tombol saklar (*toggle switch*).
   * **Klik saklar toggle "Edit Connection String" menjadi ON (hijau)** agar kotak input teks URI bisa diedit secara bebas.
3. Hapus tulisan bawaan `mongodb://localhost:27017`.
4. Paste connection string dari Atlas ke dalam kotak URI tersebut secara manual.
5. Ganti teks `<db_password>` dengan password asli kamu (`NataliaSiddharta2026`).
6. Klik tombol hijau **Save & Connect**.
7. **Penjelasan Mengenai Database `sample_mflix`:**
   * Di panel kiri Compass akan muncul database bernama `sample_mflix`. 
   * Ini adalah **sample dataset resmi bawaan MongoDB Atlas** (berisi data contoh film, bioskop, dan komentar untuk latihan), **bukan virus, bukan data orang lain, dan bukan hasil peretasan**.
   * Database ini dapat dihapus agar bersih: klik nama `sample_mflix` $\rightarrow$ klik ikon tong sampah (**Drop Database**) $\rightarrow$ ketik `sample_mflix` $\rightarrow$ klik **Drop Database**.

---

## 5. Langkah Integrasi Project Express.js (VS Code & Dependencies)

### A. Menginstal Paket yang Dibutuhkan
Buka terminal VS Code di root folder project, jalankan:
```bash
npm install express mongoose dotenv cors
npm install --save-dev nodemon
```

### B. Membuat & Mengamankan File `.env`
1. Buat file bernama `.env` di root project.
2. Masukkan konfigurasi connection string MongoDB Atlas:
   ```env
   PORT=4000
   MONGO_URI=mongodb+srv://nataliasiddharta965_db_user:NataliaSiddharta2026@cluster0.a4nzzxf.mongodb.net/db_akademik
   ```
   *(Nama database `/db_akademik` disisipkan tepat sebelum tanda tanya parameter agar dokumen tersimpan rapi di database khusus mata kuliah).*
3. **Pencegahan Kebocoran Kredensial:** Pastikan file `.gitignore` sudah memuat baris:
   ```text
   node_modules
   .env
   ```
   sehingga file kredensial `.env` tidak ikut ter-upload ke publik GitHub.

---

## 6. Daftar Error Nyata yang Dialami & Cara Mengatasinya

Selama proses pengerjaan, terdapat beberapa kendala teknis nyata yang dihadapi dan berhasil diatasi:

1. **`bad auth : authentication failed` di MongoDB Compass**
   * *Penyebab:* Password user di Atlas belum cocok dengan password yang diketik pada Compass, atau mengandung karakter khusus yang salah dibaca.
   * *Solusi:* Mengubah password user di menu *Database Access* Atlas menjadi password alfanumerik bersih tanpa simbol (`NataliaSiddharta2026`), menyalakan toggle switch *Edit Connection String* di Compass, lalu memasukkan password baru tersebut.

2. **`SyntaxError: Identifier 'express' has already been declared`**
   * *Penyebab:* Terjadi duplikasi deklarasi `const express = require('express')` saat memadukan potongan kode baru dengan sisa kode lama di `app.js`.
   * *Solusi:* Membersihkan seluruh isi file `app.js` dan menulis ulang satu file terstruktur utuh.

3. **`Error: Cannot find module 'dotenv'`**
   * *Penyebab:* Modul `dotenv` belum terpasang di dependencies lokal.
   * *Solusi:* Mematikan server nodemon sementara (Ctrl + C), lalu menjalankan perintah:
     ```bash
     npm install dotenv mongoose cors
     ```

4. **`querySrv ECONNREFUSED _mongodb._tcp.cluster0...`**
   * *Penyebab:* DNS bawaan penyedia WiFi/internet lokal menolak query format SRV cloud.
   * *Solusi:* Mengaktifkan centang toggle switch **Legacy URI String** di pop-up connect Atlas untuk menggunakan connection string standar non-SRV (`mongodb://...`), atau mengubah DNS adapter Windows ke Google DNS (`8.8.8.8`).

5. **`Cast to ObjectId failed for value "PASTE_ID_DOSEN_KAMU_DI_SINI"`**
   * *Penyebab:* Saat melakukan `POST /courses`, field `dosenPengampu` masih berisi teks string dummy dan bukan ObjectId MongoDB yang valid.
   * *Solusi:* Menjalankan `POST /dosen` terlebih dahulu, menyalin ID asli yang diterbitkan database (`6ae8a59dcf44c8fb5591488e`), kemudian memasukkannya ke payload `POST /courses`.

6. **`E11000 duplicate key error collection: ... dup key: { kode: "SI501" }`**
   * *Penyebab:* Mengirim ulang mata kuliah dengan kode yang sama, padahal schema mengatur `unique: true`.
   * *Solusi:* Membedakan data mata kuliah kedua dengan kode baru, yaitu `SI302` (Basis Data).

7. **`Updates were rejected because the remote contains work...` saat Git Push**
   * *Penyebab:* Riwayat commit di server GitHub lebih maju dibanding commit lokal karena adanya unggahan file manual di browser.
   * *Solusi:* Menjalankan sinkronisasi dengan:
     ```bash
     git pull origin main --rebase
     git push origin main
     ```

---

## 7. Struktur Kode Lengkap (`app.js`)

File utama `app.js` menggabungkan konfigurasi koneksi, definisi schema Mongoose, dan endpoint RESTful API:

```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. KONEKSI KE DATABASE MONGODB ATLAS
mongoose
  .connect(process.env.MONGO_URI)
  .then((conn) => {
    console.log(`✅ MongoDB Terhubung ke host: ${conn.connection.host}`);
    console.log(`✅ Nama Database: ${conn.connection.name}`);
  })
  .catch((err) => {
    console.error(`❌ Gagal koneksi ke MongoDB: ${err.message}`);
    process.exit(1);
  });

// ==============================================================
// 2. DATA MODELING (SCHEMA & MODEL)
// ==============================================================

// A. REFERENCING: Model Dosen (Koleksi Mandiri)
const dosenSchema = new mongoose.Schema({
  nidn: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  email: { type: String, required: true },
});
const Dosen = mongoose.model("Dosen", dosenSchema);

// B. EMBEDDING: Sub-Dokumen Jadwal Kuliah
const jadwalSchema = new mongoose.Schema({
  hari: { type: String, required: true },
  jamMulai: { type: String, required: true },
  jamSelesai: { type: String, required: true },
  ruangan: { type: String, required: true },
});

// C. SCHEMA UTAMA: Mata Kuliah (Menggabungkan Referencing & Embedding)
const courseSchema = new mongoose.Schema(
  {
    kode: { type: String, required: true, unique: true },
    namaMatkul: { type: String, required: true },
    sks: { type: Number, required: true },
    semester: { type: Number, required: true },

    // REFERENCING: Menyimpan ObjectId yang merujuk ke model Dosen
    dosenPengampu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dosen",
      required: true,
    },

    // EMBEDDING: Array sub-dokumen jadwal tertanam langsung di dalam Course
    jadwal: [jadwalSchema],
  },
  { timestamps: true }
);
const Course = mongoose.model("Course", courseSchema);

// ==============================================================
// 3. ENDPOINT / ROUTING
// ==============================================================

// GET / : Identitas Mahasiswa & Daftar Endpoint
app.get("/", (req, res) => {
  res.json({
    nama: "Natalia Siddharta",
    nim: "2428240096",
    topik: 4,
    resource: "Akademik - Mata Kuliah (MongoDB Decoupled)",
    endpoints: [
      "POST /dosen (Membuat dosen untuk relasi)",
      "GET /dosen",
      "GET /courses (Filtering, Sorting, Projection, Pagination)",
      "GET /courses/:id",
      "POST /courses",
      "PUT /courses/:id",
      "DELETE /courses/:id",
    ],
  });
});

// --- RUTE DOSEN (Kebutuhan Referencing) ---
app.post("/dosen", async (req, res, next) => {
  try {
    const dosenBaru = await Dosen.create(req.body);
    res.status(201).json({ status: "success", data: dosenBaru });
  } catch (err) {
    next(err);
  }
});

app.get("/dosen", async (req, res, next) => {
  try {
    const dosens = await Dosen.find();
    res.json({ status: "success", data: dosens });
  } catch (err) {
    next(err);
  }
});

// --- RUTE UTAMA: COURSES (Mata Kuliah) ---

// GET /courses : Mendukung Filtering, Sorting, Projection, Pagination, & Referencing (.populate)
app.get("/courses", async (req, res, next) => {
  try {
    // 1. FILTERING
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let query = Course.find(queryObj);

    // 2. SORTING (Contoh: ?sort=sks atau ?sort=-sks)
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // 3. PROJECTION (Contoh: ?fields=kode,namaMatkul)
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // 4. PAGINATION (Contoh: ?page=1&limit=1)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // 5. REFERENCING: Mengambil data detail dosen dengan .populate()
    query = query.populate("dosenPengampu", "nidn nama email");

    const courses = await query;
    const totalData = await Course.countDocuments(queryObj);

    res.status(200).json({
      status: "success",
      totalData,
      currentPage: page,
      totalPages: Math.ceil(totalData / limit),
      results: courses.length,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
});

// GET /courses/:id
app.get("/courses/:id", async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate("dosenPengampu");
    if (!course) {
      return res.status(404).json({
        status: "error",
        message: `Data dengan id ${req.params.id} tidak ditemukan`,
        data: null,
      });
    }
    res.json({ status: "success", data: course });
  } catch (err) {
    next(err);
  }
});

// POST /courses : Tambah Matkul + ID Dosen + Embedded Jadwal
app.post("/courses", async (req, res, next) => {
  try {
    const baru = await Course.create(req.body);
    res.status(201).json({
      status: "success",
      message: "Data mata kuliah berhasil ditambahkan ke MongoDB",
      data: baru,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /courses/:id
app.put("/courses/:id", async (req, res, next) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({
        status: "error",
        message: `Data dengan id ${req.params.id} tidak ditemukan`,
        data: null,
      });
    }
    res.status(200).json({
      status: "success",
      message: "Data mata kuliah berhasil diubah",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /courses/:id
app.delete("/courses/:id", async (req, res, next) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: `Data dengan id ${req.params.id} tidak ditemukan`,
        data: null,
      });
    }
    res.status(200).json({
      status: "success",
      message: `Data mata kuliah dengan id ${req.params.id} berhasil dihapus`,
      data: null,
    });
  } catch (err) {
    next(err);
  }
});

// ==============================================================
// 4. ERROR HANDLING & LISTENER
// ==============================================================

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint tidak ditemukan",
    data: null,
  });
});

app.use((err, req, res, next) => {
  res.status(400).json({
    status: "error",
    message: err.message || "Request tidak valid",
    data: null,
  });
});

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));
}

module.exports = app;
```

---

## 8. Panduan Pengujian Postman Lengkap dengan Format Body JSON

Pengujian dilakukan menggunakan Postman / Thunder Client dengan urutan request sebagai berikut:

### Langkah 1: POST Tambah Data Dosen (Kebutuhan Referencing)
* **Method:** `POST`
* **URL:** `http://localhost:4000/dosen`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "nidn": "0214058001",
    "nama": "Nur Rachmat, M.Kom.",
    "email": "nur.rachmat@mdp.ac.id"
  }
  ```
* **Respon Sukses (`201 Created`):**
  Menerbitkan dokumen dosen dengan `_id`: `"6ae8a59dcf44c8fb5591488e"`.

---

### Langkah 2: POST Tambah Mata Kuliah 1 (Embedding & Referencing)
* **Method:** `POST`
* **URL:** `http://localhost:4000/courses`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "kode": "SI501",
    "namaMatkul": "Pengembangan Aplikasi Web II",
    "sks": 4,
    "semester": 5,
    "dosenPengampu": "6ae8a59dcf44c8fb5591488e",
    "jadwal": [
      {
        "hari": "Senin",
        "jamMulai": "07:30",
        "jamSelesai": "10:00",
        "ruangan": "Lab Komputer 3"
      }
    ]
  }
  ```
* *Keterangan:* Field `dosenPengampu` merujuk ke ID Dosen (Referencing), dan `jadwal` merupakan array sub-dokumen (Embedding).

---

### Langkah 3: POST Tambah Mata Kuliah 2 (Data Pembanding)
* **Method:** `POST`
* **URL:** `http://localhost:4000/courses`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "kode": "SI302",
    "namaMatkul": "Basis Data",
    "sks": 2,
    "semester": 3,
    "dosenPengampu": "6ae8a59dcf44c8fb5591488e",
    "jadwal": [
      {
        "hari": "Rabu",
        "jamMulai": "10:30",
        "jamSelesai": "12:00",
        "ruangan": "Ruang Teori 2"
      }
    ]
  }
  ```

---

### Langkah 4: Pengujian Fitur Query (GET)

1. **Bukti Referencing & Embedding:**
   * **Method:** `GET`
   * **URL:** `http://localhost:4000/courses`
   * **Hasil:** Data mata kuliah keluar lengkap dengan objek `dosenPengampu` berisi nama & email dosen (berkat `.populate()`) serta sub-dokumen `jadwal`.

2. **Bukti Filtering:**
   * **Method:** `GET`
   * **URL:** `http://localhost:4000/courses?semester=3`
   * **Hasil:** Hanya mata kuliah semester 3 (`SI302 - Basis Data`) yang tampil.

3. **Bukti Sorting:**
   * **Method:** `GET`
   * **URL:** `http://localhost:4000/courses?sort=-sks`
   * **Hasil:** Data terurut descending dari SKS terbesar (SKS 4 lebih dahulu dibanding SKS 2).

4. **Bukti Projection:**
   * **Method:** `GET`
   * **URL:** `http://localhost:4000/courses?fields=kode,namaMatkul`
   * **Hasil:** Hanya kolom `kode` dan `namaMatkul` yang tampil di hasil JSON.

5. **Bukti Pagination:**
   * **Method:** `GET`
   * **URL:** `http://localhost:4000/courses?page=1&limit=1`
   * **Hasil:** Data dibatasi hanya 1 dokumen per halaman dengan keterangan metadata pagination (`currentPage: 1`, `totalPages: 2`).

---

## 9. Bukti Pengujian (Screenshots Hasil Postman)

Berikut adalah lampiran bukti pengujian yang tersimpan di dalam folder `Screenshot Pengujian/`:

### 1. Bukti Referencing & Embedding (`GET /courses`)
Menampilkan data mata kuliah yang sudah berelasi dengan dosen (populate) dan memiliki array jadwal:
![Referencing & Embedding](<Screenshot Pengujian/01 refrencing dan embedding.png>)

### 2. Bukti Filtering (`GET /courses?semester=3`)
Menyaring data agar hanya mata kuliah semester 3 yang tampil:
![Filtering](<Screenshot Pengujian/02 filtering.jpeg>)

### 3. Bukti Sorting (`GET /courses?sort=-sks`)
Mengurutkan mata kuliah dari SKS terbesar ke terkecil:
![Sorting](<Screenshot Pengujian/03 sorting.png>)

### 4. Bukti Projection (`GET /courses?fields=kode,namaMatkul`)
Hanya memunculkan field `kode` dan `namaMatkul`:
![Projection](<Screenshot Pengujian/04 projection.png>)

### 5. Bukti Pagination (`GET /courses?page=1&limit=1`)
Membatasi data 1 per halaman dan menyertakan info total halaman:
![Pagination](<Screenshot Pengujian/05 pagination.png>)
```

---

---







```markdown
# 📚 Dokumentasi Praktikum: RESTful API MongoDB (Embedding, Referencing & Advanced Query)

**Nama:** Natalia Siddharta  
**NIM:** 2428240096  
**Mata Kuliah:** Pengembangan Aplikasi Web II  
**Topik:** 4 - Akademik (Mata Kuliah & Dosen)  
**Dosen Pengampu:** Nur Rachmat, M.Kom.  

---

## 📑 Daftar Isi
1. [Ringkasan Tugas](#1-ringkasan-tugas)
2. [Persiapan & Konfigurasi MongoDB Atlas](#2-persiapan--konfigurasi-mongodb-atlas)
3. [Koneksi ke MongoDB Compass](#3-koneksi-ke-mongodb-compass)
4. [Kendala / Error yang Dihadapi & Solusinya](#4-kendala--error-yang-dihadapi--solusinya)
5. [Implementasi Kode (Data Modeling & Fitur Query)](#5-implementasi-kode-data-modeling--fitur-query)
6. [Panduan Pengujian Endpoint (Postman) & Format JSON](#6-panduan-pengujian-endpoint-postman--format-json)
7. [Bukti Pengujian (Screenshots)](#7-bukti-pengujian-screenshots)

---

## 1. Ringkasan Tugas
Tugas ini bertujuan memigrasikan penyimpanan data yang awalnya berbasis in-memory array menjadi database NoSQL **MongoDB** menggunakan **Mongoose**. 
Fitur utama yang diimplementasikan:
* **Referencing:** Relasi antara schema `Course` dengan schema `Dosen` menggunakan `ObjectId` dan metode `.populate()`.
* **Embedding:** Penyimpanan sub-dokumen `jadwal` (hari, jam, ruangan) secara langsung di dalam dokumen `Course`.
* **4 Fitur Query Utama pada Endpoint `GET /courses`:**
  * **Filtering:** Menyaring data spesifik melalui query parameter (misal `?semester=3`).
  * **Sorting:** Mengurutkan data (misal `?sort=-sks` secara descending).
  * **Projection:** Memilih kolom/field tertentu saja yang ditampilkan (misal `?fields=kode,namaMatkul`).
  * **Pagination:** Membatasi data per halaman menggunakan `.skip()` dan `.limit()` (misal `?page=1&limit=1`).

---

## 2. Persiapan & Konfigurasi MongoDB Atlas
1. Mendaftar dan masuk ke akun **MongoDB Atlas** ([cloud.mongodb.com](https://cloud.mongodb.com)).
2. Membuat Database Deployment baru dengan paket **M0 (Free Cluster)** pada region terdekat (AWS Singapore `ap-southeast-1`).
3. Membuat **Database User** di menu *Database Access*:
   * Username: `nataliasiddharta965_db_user`
   * Password: Diset menggunakan karakter alfanumerik tanpa simbol pemisah URL agar tidak error saat parsing.
4. Mengatur **Network Access**:
   * Menambahkan IP Address `0.0.0.0/0` (*Allow Access from Anywhere*) agar database dapat diakses secara publik dari laptop/jaringan manapun.
5. Mengambil Connection String untuk driver Node.js:
   ```text
   mongodb://.../db_akademik?ssl=true&replicaSet=...&authSource=admin
   ```
6. Menyimpan Connection String ke file `.env` lokal:
   ```env
   PORT=4000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.a4nzzxf.mongodb.net/db_akademik
   ```

---

## 3. Koneksi ke MongoDB Compass
1. Buka aplikasi **MongoDB Compass**.
2. Masukkan URI koneksi MongoDB Atlas ke kolom input koneksi.
3. Mengaktifkan saklar **Edit Connection String** untuk memastikan username, password, dan nama host sudah sesuai.
4. Klik tombol **Save & Connect**.
5. *Catatan:* Database contoh bawaan seperti `sample_mflix` adalah sampel resmi dari MongoDB Atlas dan dapat dihapus (*drop*) agar workspace tetap bersih.

---

## 4. Kendala / Error yang Dihadapi & Solusinya

| No | Pesan Error | Penyebab | Solusi yang Diterapkan |
| :---: | :--- | :--- | :--- |
| **1** | `bad auth : authentication failed` | Password yang dimasukkan di Compass salah/belum ter-update dengan user Atlas. | Mengedit password user di menu *Database Access* Atlas menjadi password alfanumerik yang jelas, lalu diisikan ulang ke Compass. |
| **2** | `SyntaxError: Identifier 'express' has already been declared` | Kode lama dan kode baru tertumpuk di `app.js` sehingga modul Express diimpor dua kali. | Membersihkan file `app.js` dan menata ulang urutan impor agar tidak ada deklarasi ganda. |
| **3** | `Cannot find module 'dotenv'` | Package `dotenv` dan `mongoose` belum terpasang di dependencies lokal. | Menjalankan perintah `npm install dotenv mongoose cors` di terminal. |
| **4** | `querySrv ECONNREFUSED ...` | DNS bawaan provider internet/WiFi memblokir resolusi DNS SRV (`mongodb+srv://`). | Menggunakan connection string standar non-SRV (Legacy URI) atau mengganti DNS laptop ke Google DNS (`8.8.8.8`). |
| **5** | `Cast to ObjectId failed for value "PASTE_ID_DOSEN_KAMU_DI_SINI"` | Field `dosenPengampu` diisi teks placeholder dan bukan format ID MongoDB yang valid. | Melakukan `POST /dosen` terlebih dahulu, meng-copy ID asli (`6ae8a59dcf44c8fb5591488e`), lalu memasukkannya ke body request course. |
| **6** | `E11000 duplicate key error collection: ... dup key: { kode: "SI501" }` | Mencoba melakukan POST kode matkul yang sama, padahal field `kode` di-set `unique: true`. | Mengganti kode matkul dengan data kedua (`SI302`) untuk mata kuliah berikutnya. |
| **7** | `Updates were rejected because the remote contains work...` saat git push | Ada perbedaan commit antara file lokal dan file yang sempat diunggah di web GitHub. | Menjalankan `git pull origin main --rebase` lalu dilanjutkan dengan `git push origin main`. |

---

## 5. Implementasi Kode (Data Modeling & Fitur Query)

Berikut adalah struktur kode utama yang diterapkan di `app.js`:

### A. Schema Referencing (Model Dosen)
```javascript
const dosenSchema = new mongoose.Schema({
  nidn: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  email: { type: String, required: true },
});
const Dosen = mongoose.model("Dosen", dosenSchema);
```

### B. Schema Embedding & Schema Utama (Mata Kuliah)
```javascript
// 1. EMBEDDING: Sub-dokumen jadwal
const jadwalSchema = new mongoose.Schema({
  hari: { type: String, required: true },
  jamMulai: { type: String, required: true },
  jamSelesai: { type: String, required: true },
  ruangan: { type: String, required: true },
});

// 2. SCHEMA UTAMA
const courseSchema = new mongoose.Schema(
  {
    kode: { type: String, required: true, unique: true },
    namaMatkul: { type: String, required: true },
    sks: { type: Number, required: true },
    semester: { type: Number, required: true },
    // REFERENCING ke koleksi Dosen:
    dosenPengampu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dosen",
      required: true,
    },
    // EMBEDDING array sub-dokumen:
    jadwal: [jadwalSchema],
  },
  { timestamps: true }
);
const Course = mongoose.model("Course", courseSchema);
```

### C. Implementasi Query di Endpoint `GET /courses`
```javascript
app.get("/courses", async (req, res, next) => {
  try {
    // 1. FILTERING
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let query = Course.find(queryObj);

    // 2. SORTING (Contoh: ?sort=-sks)
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // 3. PROJECTION (Contoh: ?fields=kode,namaMatkul)
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // 4. PAGINATION (Contoh: ?page=1&limit=1)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // REFERENCING: Mengambil data relasi dosen dengan .populate()
    query = query.populate("dosenPengampu", "nidn nama email");

    const courses = await query;
    const totalData = await Course.countDocuments(queryObj);

    res.status(200).json({
      status: "success",
      totalData,
      currentPage: page,
      totalPages: Math.ceil(totalData / limit),
      results: courses.length,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
});
```

---

## 6. Panduan Pengujian Endpoint (Postman) & Format JSON

### 1. Tambah Data Dosen (POST)
* **Method:** `POST`
* **URL:** `http://localhost:4000/dosen`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "nidn": "0214058001",
    "nama": "Nur Rachmat, M.Kom.",
    "email": "nur.rachmat@mdp.ac.id"
  }
  ```
* *Hasil Respon:* Status `201 Created` dan menghasilkan `_id` dosen: `6ae8a59dcf44c8fb5591488e`.

---

### 2. Tambah Data Mata Kuliah 1 (POST - Embedding & Referencing)
* **Method:** `POST`
* **URL:** `http://localhost:4000/courses`
* **Body (raw JSON):**
  ```json
  {
    "kode": "SI501",
    "namaMatkul": "Pengembangan Aplikasi Web II",
    "sks": 4,
    "semester": 5,
    "dosenPengampu": "6ae8a59dcf44c8fb5591488e",
    "jadwal": [
      {
        "hari": "Senin",
        "jamMulai": "07:30",
        "jamSelesai": "10:00",
        "ruangan": "Lab Komputer 3"
      }
    ]
  }
  ```

---

### 3. Tambah Data Mata Kuliah 2 (POST)
* **Method:** `POST`
* **URL:** `http://localhost:4000/courses`
* **Body (raw JSON):**
  ```json
  {
    "kode": "SI302",
    "namaMatkul": "Basis Data",
    "sks": 2,
    "semester": 3,
    "dosenPengampu": "6ae8a59dcf44c8fb5591488e",
    "jadwal": [
      {
        "hari": "Rabu",
        "jamMulai": "10:30",
        "jamSelesai": "12:00",
        "ruangan": "Ruang Teori 2"
      }
    ]
  }
  ```

---

### 4. Pengujian Fitur Query (GET)

* **A. Bukti Referencing & Embedding:**
  * **Method:** `GET`
  * **URL:** `http://localhost:4000/courses`
  * **Keterangan:** Menampilkan seluruh data di mana `dosenPengampu` muncul lengkap informasinya (populate) dan `jadwal` tertanam rapi di dalam dokumen.

* **B. Bukti Filtering:**
  * **Method:** `GET`
  * **URL:** `http://localhost:4000/courses?semester=3`
  * **Keterangan:** Hanya menampilkan mata kuliah yang berada pada semester 3 (Basis Data).

* **C. Bukti Sorting:**
  * **Method:** `GET`
  * **URL:** `http://localhost:4000/courses?sort=-sks`
  * **Keterangan:** Data diurutkan dari SKS terbesar (SKS 4) ke SKS terkecil (SKS 2).

* **D. Bukti Projection:**
  * **Method:** `GET`
  * **URL:** `http://localhost:4000/courses?fields=kode,namaMatkul`
  * **Keterangan:** Hanya menampilkan field `kode` dan `namaMatkul`. Field lainnya disembunyikan.

* **E. Bukti Pagination:**
  * **Method:** `GET`
  * **URL:** `http://localhost:4000/courses?page=1&limit=1`
  * **Keterangan:** Membatasi jumlah data yang tampil hanya 1 data per halaman dan menampilkan informasi `currentPage: 1` serta `totalPages: 2`.

---

## 7. Bukti Pengujian (Screenshots)

### 1. Bukti Referencing & Embedding (`GET /courses`)
![Referencing & Embedding](<Screenshot Pengujian/01 refrencing dan embedding.png>)

### 2. Bukti Filtering (`GET /courses?semester=3`)
![Filtering](<Screenshot Pengujian/02 filtering.jpeg>)

### 3. Bukti Sorting (`GET /courses?sort=-sks`)
![Sorting](<Screenshot Pengujian/03 sorting.png>)

### 4. Bukti Projection (`GET /courses?fields=kode,namaMatkul`)
![Projection](<Screenshot Pengujian/04 projection.png>)

### 5. Bukti Pagination (`GET /courses?page=1&limit=1`)
![Pagination](<Screenshot Pengujian/05 pagination.png>)
```


Paham! Maksud kamu: **Kondisinya di komputer lab itu kamu mau mulai bikin tugas baru dari nol (file masih kosong di lab, dan repo-nya memang belum ada di GitHub web)**, kan?

Bagus sekali kamu tanyakan ini! Cara paling rapi dan **paling anti-gagal** untuk tugas baru dari nol di komputer lab ada 2 langkah awal:

---

# 🌐 LANGKAH 1: Buat Rumahnya Dulu di Web GitHub (Paling Mudah & Rapi)

Biar kamu tidak pusing urusan git init di terminal, **buat wadah kosongnya dulu di web**:

1. Buka browser di lab, buka: **[github.com](https://github.com)** (pastikan sudah login akunmu).
2. Di pojok kanan atas, klik tanda tambah **`+`** $\rightarrow$ pilih **New repository**.
3. Isi:
   * **Repository name**: nama tugasnya (misal: `tugas2-restful-2428240096`).
   * Pilih **Public**.
   * **PENTING**: Centang kotak **"Add a README file"** (supaya reponya langsung punya cabang utama / `main` dan tidak kosong melompong).
4. Klik tombol hijau **Create repository**.
5. Selesai! Rumah tugasmu di internet sudah siap.

---

# 🖥️ LANGKAH 2: Ambil Repo Kosong Tadi ke Komputer Lab Lewat GitHub Desktop

Sekarang kita turunkan repo yang baru dibuat tadi ke komputer lab:

1. Buka aplikasi **GitHub Desktop** (pastikan sudah login akunmu).
2. Klik menu **File** $\rightarrow$ **Clone repository...**
3. Di tab **GitHub.com**, kamu akan langsung melihat nama repo yang baru saja kamu bikin di web tadi (`tugas2-restful-2428240096`).
4. Klik nama repo tersebut.
5. Di bagian **Local path** (bawah), pilih folder di komputer lab tempat kamu mau menyimpan file (misal di `D:\tugas-natalia`).
6. Klik tombol biru **Clone**.

---

# 📂 LANGKAH 3: Mulai Koding di Komputer Lab

Sekarang folder di komputer lab sudah **resmi terhubung (ter-integrasi)** dengan GitHub!

1. Di GitHub Desktop, langsung klik tombol **"Open in Visual Studio Code"**.
2. VS Code akan terbuka langsung di dalam folder tugas tersebut.
3. Di VS Code, kamu tinggal buat file-file barumu:
   * Bikin file `package.json` (`npm init -y`)
   * Bikin file `app.js`
   * Bikin folder `Screenshot Pengujian`
   * Pasang kodingan tugasmu sampai selesai.
4. Jangan lupa tekan **Ctrl + S** setiap kali membuat atau mengubah file.

---

# 🚀 LANGKAH 4: Bagaimana GitHub Desktop Mendeteksi & Mengirim File Barumu?

Karena dari awal kamu membukanya lewat clone tadi, **semua file baru yang kamu buat di VS Code akan OTOMATIS langsung terdeteksi oleh GitHub Desktop!**

1. Buka kembali aplikasi **GitHub Desktop**.
2. Di sebelah kiri, kamu akan melihat daftar file baru kamu (`app.js`, `package.json`, foto, dll) berwarna hijau dengan tanda centang biru.
3. Di pojok kiri bawah (kolom Summary), ketik:
   ```text
   init: commit tugas pertama
   ```
4. Klik tombol biru **"Commit to main"**.
5. Setelah di-commit, tombol di atas akan berubah menjadi **"Publish branch"** atau **"Push origin"**.
6. **Klik tombol "Push origin" tersebut!**

---

### 🎉 Hasilnya:
Semua file baru yang kamu buat di komputer lab tadi otomatis langsung ter-upload ke web GitHub kamu secara rapi, tanpa ada error bentrok sama sekali!
