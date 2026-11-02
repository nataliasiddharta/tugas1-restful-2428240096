# Tugas Pengembangan Aplikasi Web II - RESTful API MongoDB

**Nama:** Natalia Siddharta  
**NIM:** 2428240096  
**Topik:** 4 - Akademik (Mata Kuliah)  

---

## 📌 Deskripsi Tugas
Project ini merupakan implementasi RESTful API terintegrasi dengan **MongoDB (Mongoose)** dengan fitur:
1. **Referencing**: Relasi data antara Model `Course` dan Model `Dosen` menggunakan `ObjectId` dan fungsi `.populate()`.
2. **Embedding**: Sub-dokumen `jadwal` (hari, jam, ruangan) yang tertanam langsung di dalam `Course`.
3. **Advanced Querying pada Endpoint Utama (`GET /courses`)**:
   * **Filtering**: Menyaring data berdasarkan parameter query (misal: `?semester=3`).
   * **Sorting**: Mengurutkan data (misal: `?sort=-sks`).
   * **Projection**: Menyeleksi kolom tertentu (misal: `?fields=kode,namaMatkul`).
   * **Pagination**: Membatasi data per halaman (misal: `?page=1&limit=1`).

---

## 📸 Bukti Pengujian (Screenshots)

### 1. Bukti Referencing & Embedding (`GET /courses`)
Menampilkan data mata kuliah dengan data dosen ter-populate utuh dan array jadwal tertanam:
![Referencing & Embedding](screenshots/01_referencing_embedding.png)

### 2. Bukti Filtering (`GET /courses?semester=3`)
Menyaring data agar hanya mata kuliah semester 3 yang tampil:
![Filtering](screenshots/02_filtering.png)

### 3. Bukti Sorting (`GET /courses?sort=-sks`)
Mengurutkan mata kuliah dari SKS terbesar ke terkecil:
![Sorting](screenshots/03_sorting.png)

### 4. Bukti Projection (`GET /courses?fields=kode,namaMatkul`)
Hanya memunculkan field `kode` dan `namaMatkul`:
![Projection](screenshots/04_projection.png)

### 5. Bukti Pagination (`GET /courses?page=1&limit=1`)
Membatasi data 1 per halaman dan menyertakan info total halaman:
![Pagination](screenshots/05_pagination.png)
