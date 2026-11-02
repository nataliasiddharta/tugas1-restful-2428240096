require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// ==============================================================
// 1. KONEKSI KE MONGODB ATLAS
// ==============================================================
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
// 2. SCHEMA & MODEL (Embedding & Referencing Sesuai GitBook)
// ==============================================================

// A. REFERENCING: Model Dosen (Koleksi Mandiri)
const dosenSchema = new mongoose.Schema({
  nidn: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  email: { type: String, required: true },
});
const Dosen = mongoose.model("Dosen", dosenSchema);

// B. EMBEDDING: Sub-Dokumen Jadwal
const jadwalSchema = new mongoose.Schema({
  hari: { type: String, required: true },
  jamMulai: { type: String, required: true },
  jamSelesai: { type: String, required: true },
  ruangan: { type: String, required: true },
});

// C. MODEL UTAMA: Mata Kuliah
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

    // EMBEDDING: Array sub-dokumen jadwal tertanam langsung di sini
    jadwal: [jadwalSchema],
  },
  { timestamps: true }
);
const Course = mongoose.model("Course", courseSchema);

// ==============================================================
// 3. ENDPOINT / RUTE
// ==============================================================

// GET / : Informasi Mahasiswa & Petunjuk Endpoint
app.get("/", (req, res) => {
  res.json({
    nama: "Natalia Siddharta",
    nim: "2428240096",
    topik: 4,
    resource: "Akademik - Mata Kuliah (MongoDB Decoupled)",
    endpoints: [
      "POST /dosen (Buat data dosen untuk relasi referencing)",
      "GET /dosen",
      "GET /courses (Filtering, Sorting, Projection, Pagination)",
      "GET /courses/:id",
      "POST /courses",
      "PUT /courses/:id",
      "DELETE /courses/:id",
    ],
  });
});

// --- RUTE DOSEN (Untuk kebutuhan Referencing) ---
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

// GET /courses : Mendukung Filtering, Sorting, Projection, Pagination, & Referencing
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

    // 4. PAGINATION (Contoh: ?page=1&limit=2)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // 5. REFERENCING (.populate detail dosen)
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
// 4. ERROR HANDLING
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

// 5. MENJALANKAN SERVER
const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));
}

module.exports = app;