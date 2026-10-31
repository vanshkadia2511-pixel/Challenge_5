#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "KSHAN — Product Demo Video Build Pipeline"
echo "=========================================================="

# 1. Prerequisite checks
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required."; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo "Error: ffmpeg is required."; exit 1; }
command -v ffprobe >/dev/null 2>&1 || { echo "Error: ffprobe is required."; exit 1; }

echo "Step 1: Generating title cards and outro cards..."
node demo-video/compose/render_cards.js

echo "Step 2: Synthesizing background soundtrack..."
ffmpeg -y -f lavfi -i "aevalsrc=sin(2*PI*220*t)*exp(-0.5*mod(t\,4))*0.08 + sin(2*PI*277.18*t)*exp(-0.5*mod(t\,4))*0.06 + sin(2*PI*329.63*t)*exp(-0.5*mod(t\,4))*0.06 + sin(2*PI*440*t)*exp(-0.8*mod(t\,2))*0.04:s=44100:d=110" -af "aecho=0.8:0.88:60:0.4,lowpass=f=2500" -c:a aac -b:a 192k demo-video/assets/music/ambient_soundtrack.aac

echo "Step 3: Executing headless browser recording across all 9 scenes..."
node demo-video/record/record_all_scenes.js

echo "Step 4: Transcoding raw capture to 1920x1080 30fps H.264..."
RAW_WEBM=$(ls demo-video/record/raw/*.webm | head -n 1)
ffmpeg -y -i "$RAW_WEBM" -c:v libx264 -pix_fmt yuv420p -r 30 -crf 20 demo-video/compose/main_ui.mp4

echo "Step 5: Generating intro and outro video clips..."
ffmpeg -y -loop 1 -i demo-video/compose/title-cards/01-intro.png -c:v libx264 -t 6 -pix_fmt yuv420p -r 30 -vf "fade=t=in:st=0:d=0.5,fade=t=out:st=5.5:d=0.5" demo-video/compose/intro.mp4
ffmpeg -y -loop 1 -i demo-video/compose/title-cards/02-outro.png -c:v libx264 -t 10 -pix_fmt yuv420p -r 30 -vf "fade=t=in:st=0:d=0.5,fade=t=out:st=9.5:d=0.5" demo-video/compose/outro.mp4

echo "Step 6: Assembling full demo video (demo-full.mp4)..."
ffmpeg -y -f concat -safe 0 -i demo-video/compose/concat_list.txt -i demo-video/assets/music/ambient_soundtrack.aac -c:v libx264 -pix_fmt yuv420p -r 30 -crf 20 -c:a aac -b:a 192k -shortest -movflags +faststart demo-video/final/demo-full.mp4

echo "Step 7: Assembling 30-second teaser (demo-teaser-30s.mp4)..."
ffmpeg -y -loop 1 -i demo-video/compose/title-cards/01-intro.png -c:v libx264 -t 4 -pix_fmt yuv420p -r 30 -vf "fade=t=in:st=0:d=0.4,fade=t=out:st=3.6:d=0.4" demo-video/compose/teaser_intro.mp4
ffmpeg -y -ss 00:00:06 -i demo-video/compose/main_ui.mp4 -t 8 -c:v libx264 -pix_fmt yuv420p -r 30 demo-video/compose/teaser_clip1.mp4
ffmpeg -y -ss 00:00:23 -i demo-video/compose/main_ui.mp4 -t 6 -c:v libx264 -pix_fmt yuv420p -r 30 demo-video/compose/teaser_clip2.mp4
ffmpeg -y -ss 00:00:46 -i demo-video/compose/main_ui.mp4 -t 6 -c:v libx264 -pix_fmt yuv420p -r 30 demo-video/compose/teaser_clip3.mp4
ffmpeg -y -loop 1 -i demo-video/compose/title-cards/02-outro.png -c:v libx264 -t 6 -pix_fmt yuv420p -r 30 -vf "fade=t=in:st=0:d=0.4,fade=t=out:st=5.6:d=0.4" demo-video/compose/teaser_outro.mp4
ffmpeg -y -f concat -safe 0 -i demo-video/compose/concat_teaser.txt -i demo-video/assets/music/ambient_soundtrack.aac -c:v libx264 -pix_fmt yuv420p -r 30 -crf 20 -c:a aac -b:a 192k -shortest -movflags +faststart demo-video/final/demo-teaser-30s.mp4

echo "Step 8: Generating ffprobe verification report..."
node demo-video/compose/generate_ffprobe_report.js

echo "=========================================================="
echo "Build complete! Deliverables generated in demo-video/final/"
echo "=========================================================="
