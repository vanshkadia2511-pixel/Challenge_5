import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const composeDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([a-zA-Z]:)/, '$1'));
const rootDir = path.resolve(composeDir, '../..');
const fullVideo = path.join(rootDir, 'demo-video/final/demo-full.mp4');
const teaserVideo = path.join(rootDir, 'demo-video/final/demo-teaser-30s.mp4');
const reportPath = path.join(rootDir, 'demo-video/final/ffprobe-report.txt');

const fullReport = execSync(`ffprobe -v error -show_format -show_streams "${fullVideo}"`).toString();
const teaserReport = execSync(`ffprobe -v error -show_format -show_streams "${teaserVideo}"`).toString();

const combinedReport = `================================================================================
KSHAN DEMO VIDEO — FFPROBE VERIFICATION REPORT
Generated: 31 October 2026
================================================================================

--- 1. FULL PRODUCT DEMO (demo-full.mp4) ---
${fullReport}

--- 2. TEASER DEMO (demo-teaser-30s.mp4) ---
${teaserReport}
`;

fs.writeFileSync(reportPath, combinedReport, 'utf8');
console.log('ffprobe report written successfully to:', reportPath);
console.log(combinedReport);
