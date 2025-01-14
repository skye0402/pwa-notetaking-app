const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  const sizes = [192, 512];
  const iconDir = path.join(__dirname, '../public/icons');

  try {
    await fs.mkdir(iconDir, { recursive: true });

    // Create a simple icon with the text "Notes"
    for (const size of sizes) {
      const svg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1a73e8"/>
          <text
            x="50%"
            y="50%"
            font-family="Arial"
            font-size="${size * 0.3}"
            fill="white"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            Notes
          </text>
        </svg>
      `;

      await sharp(Buffer.from(svg))
        .png()
        .toFile(path.join(iconDir, `icon-${size}x${size}.png`));
    }

    // Generate godrej logo
    await sharp(path.join(__dirname, '../public/godrej-logo.png'))
      .resize(72, 36)
      .png()
      .toFile(path.join(__dirname, '../public/godrej-logo.png'));

    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
