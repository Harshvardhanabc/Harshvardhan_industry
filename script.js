async function convertImageToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Get the image file input
    const imageInput = document.getElementById("imageInput");
    if (imageInput.files.length === 0) {
        alert("Please select an image first.");
        return;
    }

    // Convert the image to base64
    const file = imageInput.files[0];
    const imageDataUrl = await fileToDataURL(file);

    // Add image to the PDF document
    pdf.addImage(imageDataUrl, "JPEG", 10, 10, 180, 160); // Adjust position and size as needed
    pdf.save("converted-image.pdf");
}

function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


async function convertPDFToImages() {
    const pdfInput = document.getElementById("pdfInput");
    if (pdfInput.files.length === 0) {
        alert("Please select a PDF file first.");
        return;
    }

    const file = pdfInput.files[0];
    const fileReader = new FileReader();
    
    fileReader.onload = async function () {
        const pdfData = new Uint8Array(this.result);
        
        // Load the PDF
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const zip = new JSZip();

        // Loop through each page in the PDF
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            const scale = 2; // Adjust scale as needed
            const viewport = page.getViewport({ scale: scale });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            // Set canvas dimensions to match the PDF page
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Render PDF page onto the canvas
            await page.render({ canvasContext: context, viewport: viewport }).promise;

            // Convert canvas to image data URL
            const imageDataUrl = canvas.toDataURL("image/png");

            // Add image to ZIP as a binary
            zip.file(`page_${pageNumber}.png`, imageDataUrl.split(',')[1], { base64: true });
        }

        // Generate the ZIP file and trigger the download
        zip.generateAsync({ type: "blob" }).then(function(content) {
            saveAs(content, "pdf_images.zip");
        });
    };

    fileReader.readAsArrayBuffer(file);
}
