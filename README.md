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
