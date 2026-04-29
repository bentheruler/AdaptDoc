const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} = require("../server/controllers/documentController.js");

router.post("/", authMiddleware, createDocument);
router.get("/", authMiddleware, getDocuments);
router.get("/:id", authMiddleware, getDocumentById);
router.put("/:id", authMiddleware, updateDocument);
router.delete("/:id", authMiddleware, deleteDocument);

module.exports = router;