const Document = require('../../models/Document');

// CREATE DOCUMENT
exports.createDocument = async (req, res) => {
  try {
    const document = new Document({
      user: req.user.id,
      type: req.body.type,
      title: req.body.title,
      content: req.body.content,
    });

    await document.save();
    res.status(201).json(document);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET USER DOCUMENTS
exports.getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE DOCUMENT
exports.getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE DOCUMENT
exports.updateDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!Array.isArray(doc.history)) {
      doc.history = [];
    }

    doc.history.push({
      content: doc.content,
    });

    doc.content = req.body.content ?? doc.content;
    doc.title = req.body.title ?? doc.title;
    doc.type = req.body.type ?? doc.type;

    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE DOCUMENT
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};