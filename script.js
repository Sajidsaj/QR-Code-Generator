/* script.js - Core QR Logic and Event Binding */
let qrCode = null;

// Initial options for QR Code Styling (Premium look)
const qrOptions = {
    width: 350,
    height: 350,
    type: "svg",
    data: "https://qr-master-2026.com",
    image: "",
    dotsOptions: { 
        type: "rounded", 
        gradient: {
            type: "linear",
            rotation: 0,
            colorStops: [
                { offset: 0, color: "#4f46e5" },
                { offset: 1, color: "#9333ea" }
            ]
        }
    },
    backgroundOptions: { color: "#ffffff" },
    imageOptions: { crossOrigin: "anonymous", margin: 10, imageSize: 0.4 },
    cornersSquareOptions: { 
        type: "extra-rounded",
        gradient: {
            type: "linear",
            rotation: 0,
            colorStops: [
                { offset: 0, color: "#4f46e5" },
                { offset: 1, color: "#9333ea" }
            ]
        }
    },
    cornersDotOptions: { type: "dot", color: "#4f46e5" }
};

// Map Input Elements
const elements = {
    // Nav Tabs
    typeTabs: document.querySelectorAll('.type-tab'),
    groups: document.querySelectorAll('.fields-group'),
    
    // Inputs (URL)
    urlInput: document.getElementById('url-input'), // Make sure to use optional chaining
    
    // QR Customization
    dotStyle: document.getElementById('dot-style'),
    cornerStyle: document.getElementById('corner-style'),
    color1: document.getElementById('color-1'),
    color2: document.getElementById('color-2'),
    useGradient: document.getElementById('use-gradient'),
    bgColor: document.getElementById('bg-color'),
    transparentBg: document.getElementById('transparent-bg'),
    
    // Logos
    logoUpload: document.getElementById('logo-upload'),
    builtinLogo: document.getElementById('builtin-logo'),
    
    // Download Buttons
    btnPng: document.getElementById('btn-png'),
    btnSvg: document.getElementById('btn-svg'),
    btnPdf: document.getElementById('btn-pdf')
};

document.addEventListener("DOMContentLoaded", () => {
    // Initialize QR Code Instance
    qrCode = new QRCodeStyling(qrOptions);
    qrCode.append(document.getElementById("qr-container"));
    
    // Bind all inputs for live reload
    document.querySelectorAll('input, select, textarea').forEach(el => {
        if(el.type !== 'file') {
            el.addEventListener('input', debounce(updateQR, 100)); // fast visual feedback
        }
    });

    // Special File Upload Listener
    if(elements.logoUpload) {
        elements.logoUpload.addEventListener('change', updateQR);
    }

    // Bind Type Tabs (URL, Text, WiFi, etc)
    if(elements.typeTabs) {
        elements.typeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active classes
                elements.typeTabs.forEach(t => t.classList.remove('bg-purple-600', 'text-white', 'shadow-lg'));
                // Add active classes to current
                tab.classList.add('bg-purple-600', 'text-white', 'shadow-lg');
                
                // Toggle Field Groups
                const type = tab.dataset.type;
                document.querySelectorAll('.fields-group').forEach(fg => fg.classList.add('hidden'));
                const activeGroup = document.getElementById(`fields-${type}`);
                if(activeGroup) activeGroup.classList.remove('hidden');
                
                updateQR();
            });
        });
        
        // Auto-click first tab
        if(elements.typeTabs[0]) elements.typeTabs[0].click();
    }

    // Bind Download Buttons
    if(elements.btnPng) elements.btnPng.addEventListener('click', () => download('png'));
    if(elements.btnSvg) elements.btnSvg.addEventListener('click', () => download('svg'));
    if(elements.btnPdf) elements.btnPdf.addEventListener('click', () => download('pdf')); // NOTE: qr-code-styling may not natively support PDF, might need jsPDF. but PNG fallback works.
});

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function getQRData() {
    const activeTab = document.querySelector('.type-tab.bg-purple-600');
    if(!activeTab) return "https://google.com";
    
    const type = activeTab.dataset.type;
    
    try {
        if (type === 'url') return document.getElementById('url-input').value || "https://google.com";
        if (type === 'text') return document.getElementById('text-input').value || "Hello World";
        if (type === 'wifi') {
            const ssid = document.getElementById('wifi-ssid').value;
            const pass = document.getElementById('wifi-pass').value;
            const enc = document.getElementById('wifi-enc').value;
            return `WIFI:T:${enc};S:${ssid};P:${pass};;`;
        }
        if (type === 'vcard') {
            const name = document.getElementById('vcard-name').value;
            const phone = document.getElementById('vcard-phone').value;
            const email = document.getElementById('vcard-email').value;
            const company = document.getElementById('vcard-company').value;
            return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${company}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
        }
        if (type === 'crypto') {
            const coin = document.getElementById('crypto-coin').value;
            const address = document.getElementById('crypto-address').value;
            if(!address) return "";
            return `${coin}:${address}`;
        }
        if (type === 'email') {
            const address = document.getElementById('email-address').value;
            const sub = document.getElementById('email-subject').value;
            if(!address) return "";
            return `mailto:${address}?subject=${encodeURIComponent(sub)}`;
        }
    } catch(e) {
        console.warn("Input reading err:", e);
    }
    return "Something went wrong";
}

function updateQR() {
    if (!qrCode) return;

    const data = getQRData();
    if(!data) return; // Wait until valid

    const dotsType = elements.dotStyle.value;
    const cornerStyle = elements.cornerStyle.value;
    
    const fg1 = elements.color1.value;
    const fg2 = elements.color2.value;
    const isGradient = elements.useGradient.checked;
    
    const bgColor = elements.transparentBg.checked ? "transparent" : elements.bgColor.value;

    const options = { data: data };

    // Apply Dots & Colors
    if (isGradient) {
        options.dotsOptions = {
            type: dotsType,
            gradient: { type: "linear", rotation: Math.PI/4, colorStops: [{ offset: 0, color: fg1 }, { offset: 1, color: fg2 }] }
        };
        options.cornersSquareOptions = {
            type: cornerStyle,
            gradient: { type: "linear", rotation: Math.PI/4, colorStops: [{ offset: 0, color: fg1 }, { offset: 1, color: fg2 }] }
        };
        options.cornersDotOptions = { type: 'dot', color: fg1 };
    } else {
        options.dotsOptions = { type: dotsType, color: fg1 };
        options.cornersSquareOptions = { type: cornerStyle, color: fg1 };
        options.cornersDotOptions = { type: 'dot', color: fg1 };
    }

    options.backgroundOptions = { color: bgColor };

    // Apply Logo
    if (elements.logoUpload.files && elements.logoUpload.files[0]) {
        options.image = URL.createObjectURL(elements.logoUpload.files[0]);
    } else if (elements.builtinLogo.value !== "none") {
        options.image = elements.builtinLogo.value;
    } else {
        // No logo
        options.image = "";
    }

    // Perform Update
    qrCode.update(options);
}

function download(extension) {
    if(!qrCode) return;
    if(extension === 'pdf') {
        // Due to jsPDF complexity for SVG wrapping, downloading high quality PNG inside jsPDF is best approach.
        // We will include jsPDF library in index.html to support this.
        if (typeof window.jspdf !== 'undefined') {
             qrCode.getRawData("png").then(buffer => {
                const blob = new Blob([buffer], { type: "image/png" });
                const imgURL = URL.createObjectURL(blob);
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();
                pdf.addImage(imgURL, "PNG", 35, 35, 140, 140); 
                pdf.save("QR_Master_Premium.pdf");
             });
             return;
        } else {
             alert('PDF Module Loading... Try again in a second.');
        }
    } else {
        qrCode.download({ name: "QR_Master_Premium", extension: extension });
    }
}
