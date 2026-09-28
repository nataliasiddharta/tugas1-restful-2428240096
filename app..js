// impor express
const express = require("express");
const app = express();

// middleware untuk membaca body JSON
app.use(express.json());

// data awal (array di memori)
let courses = [
  { id: 1, kode: "IF301", namaMatkul: "Pemrograman Web Lanjut", sks: 3, semester: 3, dosenPengampu: "Budi Santoso, M.Kom" },
  { id: 2, kode: "SI302", namaMatkul: "Basis Data", sks: 3, semester: 3, dosenPengampu: "Siti Rahma, M.T." },
  { id: 3, kode: "SI501", namaMatkul: "Pengembangan Aplikasi Web II", sks: 3, semester: 5, dosenPengampu: "Andi Wijaya, M.Kom" },
];
let nextId = 4; // id berikutnya

// fungsi validasi field wajib (kembalikan pesan error, atau null jika valid)
function validasi(body) {
  const { kode, namaMatkul, sks, semester } = body;
  if (!kode) return "Field kode wajib diisi";
  if (!namaMatkul) return "Field namaMatkul wajib diisi";
  if (sks === undefined || sks === null || sks === "") return "Field sks wajib diisi";
  if (typeof sks !== "number") return "Field sks harus berupa angka";
  if (semester === undefined || semester === null || semester === "") return "Field semester wajib diisi";
  if (typeof semester !== "number") return "Field semester harus berupa angka";
  return null;
}

// GET /
app.get("/", (req, res) => {
  res.json({
    nama: "Natalia Siddharta",
    nim: "2428240096",
    topik: 4,
    resource: "Akademik - Mata Kuliah",
    endpoints: [
      "GET /courses",
      "GET /courses/:id",
      "GET /courses?semester=3",
      "POST /courses",
      "PUT /courses/:id",
      "DELETE /courses/:id",
    ],
  });
});

// GET /courses  atau  GET /courses?semester=3
app.get("/courses", (req, res) => {
  const { semester } = req.query;
  if (semester !== undefined) {
    // filter berdasarkan semester, kembalikan array (boleh kosong)
    const hasil = courses.filter((c) => c.semester === parseInt(semester));
    return res.json(hasil);
  }
  res.json(courses);
});

// GET /courses/1
app.get("/courses/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const course = courses.find((c) => c.id === id);
  if (!course) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null,
    });
  }
  res.json(course); // GET: data langsung tanpa status/message
});