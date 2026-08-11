const {jsPDF}=require('jspdf')

exports.pdf = (data) => {
  const doc = new jsPDF();
  let y = 20;

  data.forEach((item, index) => {
    doc.text(`Record ${index + 1}`, 10, y);
    y += 10;

    Object.entries(item).forEach(([key, value]) => {
      if (key === "_id" || key === "__v") return;

      doc.text(`${key}: ${String(value)}`, 10, y);
      y += 10;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 10;
  });

  return Buffer.from(doc.output("arraybuffer"));
};