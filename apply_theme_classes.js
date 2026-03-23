const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            filelist = walkSync(dirFile, filelist);
        } else {
            if (dirFile.endsWith('.jsx')) filelist.push(dirFile);
        }
    });
    return filelist;
};

const components = walkSync(path.join(__dirname, 'src'));

components.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Backgrounds:
    // Convert standard light backgrounds to the dark modern background
    content = content.replace(/bg-white/g, 'bg-white'); // maps to #121826 in tailwind
    content = content.replace(/bg-gray-50/g, 'bg-gray-50'); // maps to #0B0F19
    content = content.replace(/bg-gray-100/g, 'bg-gray-100'); // maps to #0B0F19
    content = content.replace(/bg-gray-200/g, 'bg-gray-200'); // maps to #1f2937

    // Texts:
    // Convert dark texts to light
    content = content.replace(/text-gray-900/g, 'text-gray-900'); // maps to #fff
    content = content.replace(/text-gray-800/g, 'text-gray-800'); // maps to #fff
    content = content.replace(/text-gray-700/g, 'text-gray-700'); // maps to #e5e7eb
    content = content.replace(/text-gray-600/g, 'text-gray-600'); // maps to #e5e7eb
    content = content.replace(/text-black/g, 'text-black');       // maps to #fff

    // Custom Colors (Old Palettes):
    // Dark Blue -> Accent (Purple)
    content = content.replace(/bg-\[\#21277B\]/g, 'bg-accent');
    content = content.replace(/text-\[\#21277B\]/g, 'text-text'); // usually headings -> make white
    content = content.replace(/border-\[\#21277B\]/g, 'border-accent');

    // Primary Blue -> New Primary (Light Blue)
    content = content.replace(/bg-\[\#006AD7\]/g, 'bg-primary');
    content = content.replace(/text-\[\#006AD7\]/g, 'text-primary');
    content = content.replace(/border-\[\#006AD7\]/g, 'border-primary');
    content = content.replace(/to-\[\#006AD7\]/g, 'to-primary');
    content = content.replace(/from-\[\#006AD7\]/g, 'from-primary');

    // Secondary Light Blue -> Accent (Purple)
    content = content.replace(/bg-\[\#9AD9EA\]/g, 'bg-accent');
    content = content.replace(/text-\[\#9AD9EA\]/g, 'text-accent');
    content = content.replace(/border-\[\#9AD9EA\]/g, 'border-accent');

    // Some components might have literal hex strings in logic (like jsPDF):
    content = content.replace(/'#006AD7'/g, "'#5B8CFF'");
    content = content.replace(/'#9AD9EA'/g, "'#A855F7'");
    content = content.replace(/'#21277B'/g, "'#A855F7'");

    // Update PDF RGB values inside Reservation.jsx based on new colors
    // Primary: #5B8CFF -> 91, 140, 255
    // Accent: #A855F7 -> 168, 85, 247
    if (file.includes('Reservation.jsx')) {
        content = content.replace(/const primaryColor = \[33, 39, 123\];.*?\/\/\s*#21277B/g, 'const primaryColor = [168, 85, 247]; // #A855F7 (Accent as dark substitute)');
        content = content.replace(/const accentColor = \[0, 106, 215\];.*?\/\/\s*#006AD7/g, 'const accentColor = [91, 140, 255];  // #5B8CFF (New Primary)');
        content = content.replace(/doc\.setDrawColor\(0, 106, 215\);/g, 'doc.setDrawColor(91, 140, 255);');
        content = content.replace(/doc\.setTextColor\(33, 39, 123\);.*?\/\/\s*#21277B/g, 'doc.setTextColor(255, 255, 255); // #FFFFFF text on tickets usually better as black/dark if printing, but standardizing.');
    }

    fs.writeFileSync(file, content);
});

console.log('✅ Component files successfully updated with new tailwind theme classes.');
