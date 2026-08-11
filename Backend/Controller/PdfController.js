const { pdf } = require("../utils/pdfdownload");

exports.downloadpdf = async (req, res) => {
  try {
    const { pdfdata } = req.body;

    const pdfBuffer = pdf(pdfdata);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="tasks.pdf"');

    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "internal server error" });
  }
};