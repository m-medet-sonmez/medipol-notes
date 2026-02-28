const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join('C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\70adad38-63b1-4bed-a0ba-bfe71ac72975\\kafarahat_app_icon_1772283003201.png');
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

async function generateIcons() {
    // 192x192
    await sharp(inputPath)
        .resize(192, 192)
        .png()
        .toFile(path.join(iconsDir, 'icon-192x192.png'));
    console.log('Generated icon-192x192.png');

    // 512x512
    await sharp(inputPath)
        .resize(512, 512)
        .png()
        .toFile(path.join(iconsDir, 'icon-512x512.png'));
    console.log('Generated icon-512x512.png');
}

generateIcons().catch(console.error);
