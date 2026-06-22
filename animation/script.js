"use strict";

/*
  UNSTUCK ANIMATION CONTROLS
  --------------------------
  All artwork is embedded below, so this project needs only these three files.
  Edit CONFIG to adjust timing, positions, spacing, and scale.
*/

const CONFIG = {
  // Animation positions use the original 440 × 200 design coordinate system.
  design: { width: 440, height: 200 },
  preview: { width: 880, height: 400 },
  export: { width: 1760, height: 800 },
  fps: 30,
  duration: 5.69,

  // Timing, in seconds.
  cameraStart: 0.0,
  cameraSpeed: 115,
  postSitPanDuration: 1.10,

  // Final lockup is centered as a group, not by the wordmark alone.
  final: {
    rabbitWidth: 98,
    logoWidth: 250,
    gap: 4,
    baseline: 177
  },

  // Running pose sizing and path. Coordinates are at 440 × 200.
  run: {
    width: 130,
    startX: -142,
    speed: 90, // constant horizontal speed in design pixels per second
    sitTriggerGap: 12,
    baseline: 178,
    frameHold: 5 // alternate every 5 frames for a calmer run cycle
  },

  colors: { background: "#E72D48" }
};

// Original vector paths supplied with the project, embedded for portability.
const SVG = {
  rabbit1: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 315.7 217.27"><path fill="#f3f3eb" d="M84.25,184.71l-4.01,14.26c-1.98,7.04-9.85,14.02-17.38,12.82-4.25-.68-3.75-11.28,1.95-20.43,7.39-11.87.09-28.42,10.84-32.16l-4.43-3.2-5.56,7.65c-4.7,6.47-10.46,12.75-18.46,13.71-1.35.16-3.93-.36-4.62-1.18-.83-.98-1.12-3.91-.91-5.33.84-5.64,4.01-8.71,7.78-12.55,8.77-8.93,10.04-23.43,16.38-25.41,2.5-.78,6.13.61,8.44,2.11.28-6.62.93-12.67,2.66-18.5-7.12-1.78-11.4-7.82-10.17-15.26,1.11-6.74,4.33-15.43,12.88-15.75,4.64-.17,8.87,6.81,10.49,10.87,38.15-26,76.04-5.46,91.17-9.19l13.73-3.38,3.34-15.76c-1.9-4.44-8.4-6.51-13.08-7.46-18.16-3.96-33.12-13.81-43.13-29.38l-.47-4.51c-.52-5.08,27.77.23,39.86,7.72-11.39-8.97-23.24-29.74-15.99-30.19,12.61-.78,31.45,11.98,37.14,20.05l15.61,22.13c2.78,3.95,6.24,5.41,10.95,5.92,9.51,1.02,19.79,3.66,26.53,10.73l9.74,13.2c2.57,3.48,5.01,6.6,4.88,11.21-.1,3.6-2.81,7.4-5.89,10.41-9.56,9.34-18.45,4.25-23.04,12.4,3.28,11.02,1.72,21.16-3.95,31.28,5.47,6.57,11.19,12,17.98,16.74l10.69,3.13c3.97,1.16,7.96,5.28,7.91,9.26-9.53,7.33-21.05,3.65-29.96-2.14l-20.2-8.86,14.03,16.76,10.05,3c3.81,1.14,9.17,5.99,7.34,10.31-7.86,5.37-19.94,3.95-27.7-1.62l-18.12-12.98c-6.95-4.98-13.88-9.52-19.95-15.83-11.2-.04-21.85-2.15-32.63-5.75-4.78-1.6-9.93-2.07-15.31-2.2-5.35,10.95-14.21,18-25.73,21.79-16.96,5.58-27.82-2.11-31.68,11.6Z"/></svg>`,
  rabbit2: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 315.7 217.27"><path fill="#f3f3eb" d="M256.79,101.01l-7.18-14.75c-5.34-8.17-14.98-12.64-24.14-15.37-4.54-1.35-7.67-3.42-9.69-7.81l-11.33-24.59c-4.13-8.96-20.33-24.93-32.88-26.46-7.21-.88.67,21.7,10.24,32.59-10.53-9.55-37.39-19.92-37.8-14.83l-.31,3.83c-.04.46.04.92.21,1.35,7.07,16.79,19.88,28.97,36.8,36.08,4.42,1.79,10.44,5.01,11.5,9.71l-6.15,14.89-14.12.83c-15.55.91-49.08-26.17-91.32-7.53-.86-4.29-3.75-11.92-8.34-12.59-8.47-1.24-13.21,6.72-15.53,13.15-2.56,7.09.55,13.81,7.23,16.86-2.57,6.65-2.99,10-3.91,15.44-.91,4.37-1.84,11.35-1.25,20.13.29,4.36,1.97,8.08,4.05,11.1-.92.69-1.81,1.4-2.63,2.15-2.57,2.38-2.86,6.06-2.71,9.3.38,8.21,15.05,14.09,23.09,27.18,3.46,5.63,6.18,10.31,12.77,12.89,1.66.65,5.31,1.11,6.77.37,1.22-.61,2.68-3.59,2.92-5.27,1.4-9.95-4.99-18.65-11.35-26.13l-5.03-6.44c.37.01.74.02,1.12.01,4.19,4.13,10.99,7.89,13.32,15.02,2.98,9.13,10.19,14.86,13.29,11.83,5.48-5.37,5.38-15.13,1.61-20.25l-6.28-8.52c3.69-.87,7.02-2.57,9.88-6.09.8-.99,7.43-3.06,8.8-3.29,5.44-.93,5.31-.82,9.13,1.29,9.94,5.5,18.46,9.74,29.47,11.81l3.53.69c-.65,3.92-1.62,7.56-3.71,10.08-.22.27-.5.48-.81.66l-10.73,6c-3.24,1.84-3.69,6.55-2.97,10.09.2,1,1.01,1.81,2.09,2.06,11.26,2.65,22.17-5.12,29.34-12.34.19-.19.34-.4.47-.63.73-1.34,3.54-6.49,6.68-11.95l1.22.24-1.04,6.29c-.13.76-.52,1.52-1.12,2.17l-4.76,6.59c-1.47,1.58-3.2,5.13-3.44,8.38-.27,3.68,4.31,5.64,8.41,3.6,8.07-4.01,17.41-13.64,20.58-19.82.23-.45.36-.91.43-1.37l1.95-13.02c.05-.31.13-.61.24-.91.29-.79.55-1.68.8-2.61l3.24-2.99c7.4-8.91,10.77-18.59,9.55-30.02,6-7.19,13.81-.56,24.91-8.01,3.57-2.4,6.93-5.64,7.68-9.17.96-4.51-.87-8.03-2.76-11.91Z"/></svg>`,
  rabbit3: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 197.65 230.35"><path fill="#f3f3eb" stroke="#f3f3eb" stroke-width=".5" d="M132.09,204.03c20.19-1.77,27.7,11.13,23.5,11.35l-24.75,1.28,2.36,3.94c.51.86-2.19,2.77-3.2,2.81l-21.35.84-28.88-.57c-11.62-.23-12.06-5.4-17.89-4.04-7.62,1.78-15.13-.95-18.85-7.81-1.22-2.25-1.06-5.91.81-7.74,1.64-1.6,4.87-2.33,8-1.93-6.28-24.36.81-49.81,17.26-69l12.61-14.71,9.56-14.88c4.22-4.75,7.09-9.43,6.01-16.24-1.12-7.12.02-14.1,2.99-20.8-.7-3.72-4.32-6.67-7.93-8.18-25.89-10.88-37.71-39.54-33.01-43.52,4.53-3.84,20.16,5.18,28.05,10.61,10.15,7,16.1,17.02,24.59,26.7-6.57-15.24-10.2-29.69-5.28-45.08.33-1.04,1.74-2.74,2.63-3.16,1.03-.49,3.62.58,4.42,1.57,8.73,10.94,12.54,23.83,12.02,37.93-.1,2.75.53,6.58,1.36,9.17l10.19,3.15c7.13,2.2,10.96,6.78,15.02,12.52,2.88,4.07,7.31,7.89,8.5,12.69,2.22,8.95-6.94,14.52-16.15,17.71-7.02,2.43,7.27,18.48,1.25,38.53-1.17,3.89-.49,7.64,2.46,10.52l8.7,8.48c3.7,3.6,7.56,18.43,3.56,20.14-1.14.49-3.17-.2-5.19-.76-.06.6-1.53,3.75-2.64,3.87-9.39.97-9.81-12.67-18.64-14.96-3.97,1.95-2.41,5.99-.97,8.69,2.95,5.51,2.17,13.22-1.34,18.22l-8.53,12.14c3.03.5,6.02.77,8.76.53Z"/></svg>`,
  logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 315.7 184.98"><g fill="#f3f3eb"><path d="M52.54 144.98c0 23.31-7.01 35.07-17.43 35.07s-17.33-11.76-17.33-34.85V10.15h14.03v137.88c0 6.32 1.59 9.58 4.04 9.58 2.23 0 3.19-3.27 3.19-9.8V10.15h13.5v134.83Z"/><path d="M92.39 177.87H81.98L71.46 91.83v86.04H59.77V10.15h11.9l9.04 74.28V10.15H92.4v167.72Z"/><path d="M131.67 141.72c0 26.79-6.8 38.34-17.11 38.34-10.95 0-15.31-13.72-15.31-37.9 0-9.15.43-17.43.85-23.53l10.63 2.61c-.43 6.32-.74 12.85-.74 18.52 0 14.16 1.17 17.86 3.72 17.86 2.34 0 3.61-3.7 3.61-13.94v-4.58c0-12.42-1.7-23.74-8.61-40.95-6.91-16.99-9.67-30.71-9.67-49.88v-2.61c0-21.78 4.15-38.34 16.26-38.34s15.2 15.03 15.2 37.9c0 8.28-.32 14.16-.74 20.69l-10.73-2.62c.32-5.66.53-6.97.53-15.68 0-14.59-1.06-18.08-3.29-18.08s-3.08 3.27-3.08 13.07v3.49c0 9.58 1.81 19.38 6.8 32.45 7.01 18.51 11.69 38.55 11.69 59.9v3.27Z"/><path d="M172.93 33.24h-11.16v144.63h-14.14V33.24h-11.05V10.15h36.35v23.09Z"/><path d="M213.93 144.98c0 23.31-7.01 35.07-17.43 35.07s-17.32-11.76-17.32-34.85V10.15h14.03v137.88c0 6.32 1.59 9.58 4.04 9.58 2.23 0 3.19-3.27 3.19-9.8V10.15h13.5v134.83Z"/><path d="M237.79 180.05c-10.52 0-17.11-10.89-17.11-35.51V43.7c0-24.18 6.59-36.38 16.9-36.38 9.35 0 16.16 6.75 16.16 36.81 0 8.28-.43 16.55-.85 22.87l-10.73-1.74c.43-5.88.74-11.98.74-17.86 0-15.68-1.81-17.86-4.36-17.86s-3.72 2.18-3.72 10.67v106.73c0 7.62.96 11.11 4.15 11.11 2.34 0 3.93-3.27 3.93-19.17 0-5.23-.32-11.54-.74-17.86l10.84-1.74c.43 6.1.85 13.29.85 23.09 0 30.71-6.8 37.68-16.05 37.68Z"/><path d="M297.91 177.87h-14.67l-6.69-68.61-2.02 10.89v57.72h-14.14V10.15h14.14V59.6l8.61-49.45h13.5l-11.27 60.99 12.54 106.73Z"/></g></svg>`
};

const preview = document.querySelector("#preview");
const status = document.querySelector("#status");
const buttons = [...document.querySelectorAll("button")];
let previewStart = performance.now();


// Convert the embedded SVG geometry to native canvas paths. This avoids an
// intermediate bitmap and keeps the preview and export edges as crisp as possible.
const artwork = Object.fromEntries(Object.entries(SVG).map(([name, svg]) => {
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  const viewBox = document.documentElement.viewBox.baseVal;
  return [name, {
    width: viewBox.width,
    height: viewBox.height,
    paths: [...document.querySelectorAll("path")].map(path => new Path2D(path.getAttribute("d")))
  }];
}));

// The live preview uses real inline SVG paths—no canvas and no rasterization.
const previewGroups = Object.fromEntries(Object.entries(SVG).map(([name, svg]) => {
  const source = new DOMParser().parseFromString(svg, "image/svg+xml");
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("fill", "#F3F3EB");
  source.querySelectorAll("path").forEach(sourcePath => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", sourcePath.getAttribute("d"));
    group.appendChild(path);
  });
  group.style.display = "none";
  preview.appendChild(group);
  return [name, group];
}));

function drawByWidth(context, vector, x, baseline, width, yOffset = 0) {
  const scale = width / vector.width;
  const height = vector.height * scale;
  context.save();
  context.translate(x, baseline - height + yOffset);
  context.scale(scale, scale);
  context.fillStyle = "#F3F3EB";
  vector.paths.forEach(path => context.fill(path));
  context.restore();
}

function finalLayout() {
  const { rabbitWidth, logoWidth, gap, baseline } = CONFIG.final;
  const groupWidth = rabbitWidth + gap + logoWidth;
  const left = (CONFIG.design.width - groupWidth) / 2;
  return {
    rabbitX: left,
    logoX: left + rabbitWidth + gap,
    rabbitWidth,
    logoWidth,
    baseline
  };
}

function preSitLogoPosition(time, lockup) {
  const logoWorldX = CONFIG.design.width + 12;
  const cameraTravel = CONFIG.cameraSpeed * Math.max(0, time - CONFIG.cameraStart);
  return Math.max(lockup.logoX, logoWorldX - cameraTravel);
}

function rabbitPosition(time, lockup) {
  // Deliberately linear: no easing, acceleration, or hidden camera offset.
  return CONFIG.run.startX + CONFIG.run.speed * time;
}

function calculateSitTime() {
  const lockup = finalLayout();
  const totalFrames = Math.ceil(CONFIG.duration * CONFIG.fps);
  for (let frame = 0; frame < totalFrames; frame += 1) {
    const time = frame / CONFIG.fps;
    if (time < CONFIG.cameraStart) continue;
    const rabbitNose = rabbitPosition(time, lockup) + CONFIG.run.width;
    const gapToLogo = preSitLogoPosition(time, lockup) - rabbitNose;
    if (gapToLogo <= CONFIG.run.sitTriggerGap) return time;
  }
  return CONFIG.cameraStart;
}

const SIT_TIME = calculateSitTime();

function logoPosition(time, lockup) {
  if (time <= SIT_TIME) return preSitLogoPosition(time, lockup);

  // After the rabbit sits, finish the remaining distance in exactly 1.10
  // seconds with a gentle cubic ease-out into the centered end frame.
  const startX = preSitLogoPosition(SIT_TIME, lockup);
  const progress = Math.min(1,
    Math.max(0, (time - SIT_TIME) / CONFIG.postSitPanDuration));
  const easedProgress = 1 - Math.pow(1 - progress, 3);
  return startX + (lockup.logoX - startX) * easedProgress;
}

function shouldSit(time) {
  return time >= SIT_TIME;
}

function sittingPosition(time, lockup) {
  // After the pose swap, keep the rabbit attached to the logo so the remaining
  // camera pan moves the completed lockup as one unit.
  return logoPosition(time, lockup) - CONFIG.final.gap - lockup.rabbitWidth;
}

function positionPreview(group, vector, x, baseline, width, yOffset = 0) {
  const scale = width / vector.width;
  const height = vector.height * scale;
  group.setAttribute("transform", `translate(${x} ${baseline - height + yOffset}) scale(${scale})`);
}

function updatePreview(time) {
  const t = Math.min(time, CONFIG.duration - 1 / CONFIG.fps);
  const lockup = finalLayout();
  const hasLogo = t >= CONFIG.cameraStart;
  const isSitting = shouldSit(t, lockup);

  previewGroups.logo.style.display = hasLogo ? "" : "none";
  if (hasLogo) {
    positionPreview(previewGroups.logo, artwork.logo,
      logoPosition(t, lockup), lockup.baseline, lockup.logoWidth);
  }

  const frame = Math.floor(t * CONFIG.fps / CONFIG.run.frameHold) % 2;
  previewGroups.rabbit1.style.display = !isSitting && frame === 0 ? "" : "none";
  previewGroups.rabbit2.style.display = !isSitting && frame === 1 ? "" : "none";
  previewGroups.rabbit3.style.display = isSitting ? "" : "none";

  if (isSitting) {
    positionPreview(previewGroups.rabbit3, artwork.rabbit3,
      sittingPosition(t, lockup), lockup.baseline, lockup.rabbitWidth);
  } else {
    const runningGroup = frame === 0 ? previewGroups.rabbit1 : previewGroups.rabbit2;
    const runningArt = frame === 0 ? artwork.rabbit1 : artwork.rabbit2;
    const hop = frame === 0 ? -2 : 1;
    positionPreview(runningGroup, runningArt, rabbitPosition(t, lockup),
      CONFIG.run.baseline, CONFIG.run.width, hop);
  }
}

function drawFrame(context, time, scale = 1) {
  const width = CONFIG.design.width;
  const height = CONFIG.design.height;
  const t = Math.min(time, CONFIG.duration - 1 / CONFIG.fps);
  const lockup = finalLayout();

  context.save();
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.fillStyle = CONFIG.colors.background;
  context.fillRect(0, 0, width, height);

  // Camera pans across the scene to reveal the stationary wordmark.
  if (t >= CONFIG.cameraStart) {
    drawByWidth(context, artwork.logo, logoPosition(t, lockup),
      lockup.baseline, lockup.logoWidth);
  }

  if (!shouldSit(t, lockup)) {
    // A brisk entrance followed by a longer ease into the lockup.
    const x = rabbitPosition(t, lockup);
    const frame = Math.floor(t * CONFIG.fps / CONFIG.run.frameHold) % 2;
    const hop = frame === 0 ? -2 : 1;
    drawByWidth(context, frame === 0 ? artwork.rabbit1 : artwork.rabbit2,
      x, CONFIG.run.baseline, CONFIG.run.width, hop);
  } else {
    drawByWidth(context, artwork.rabbit3, sittingPosition(t, lockup), lockup.baseline,
      lockup.rabbitWidth);
  }

  context.restore();
}

function previewLoop(now) {
  const time = ((now - previewStart) / 1000) % CONFIG.duration;
  updatePreview(time);
  requestAnimationFrame(previewLoop);
}

function supportedMime() {
  const candidates = ["video/mp4;codecs=avc1.42E01E", "video/mp4;codecs=h264", "video/mp4"];
  return candidates.find(type => MediaRecorder.isTypeSupported(type)) || "";
}

function download(blob, extension) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `unstuck-rabbit-1760x800.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function exportAnimation() {
  const mimeType = supportedMime();
  if (!mimeType) {
    status.textContent = "MP4 / H.264 is not supported in this browser.";
    return;
  }

  buttons.forEach(button => { button.disabled = true; });
  status.textContent = "Rendering MP4… 0%";

  const canvas = document.createElement("canvas");
  canvas.width = CONFIG.export.width;
  canvas.height = CONFIG.export.height;
  const context = canvas.getContext("2d", { alpha: false });
  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    // H.264 at 16 Mbps, within the requested 15–20 Mbps range.
    videoBitsPerSecond: 16_000_000
  });
  const chunks = [];
  recorder.ondataavailable = event => {
    if (event.data.size) chunks.push(event.data);
  };

  const stopped = new Promise(resolve => recorder.addEventListener("stop", resolve, { once: true }));
  recorder.start();

  const totalFrames = Math.round(CONFIG.duration * CONFIG.fps);
  for (let frame = 0; frame < totalFrames; frame += 1) {
    drawFrame(context, frame / CONFIG.fps,
      CONFIG.export.width / CONFIG.design.width);
    track.requestFrame();
    status.textContent = `Rendering MP4… ${Math.round((frame + 1) / totalFrames * 100)}%`;
    // MediaRecorder timestamps are real-time; canvas frames are generated directly,
    // not captured from the screen.
    await new Promise(resolve => setTimeout(resolve, 1000 / CONFIG.fps));
  }

  recorder.stop();
  await stopped;
  track.stop();
  download(new Blob(chunks, { type: mimeType }), "mp4");
  status.textContent = "MP4 exported at exactly 1760 × 800 px.";
  buttons.forEach(button => { button.disabled = false; });
}

document.querySelector("#restart").addEventListener("click", () => {
  previewStart = performance.now();
  status.textContent = "Preview restarted.";
});
document.querySelector("#exportMp4").addEventListener("click", exportAnimation);

previewStart = performance.now();
status.textContent = supportedMime()
  ? "Ready."
  : "MP4 / H.264 is not supported in this browser.";

requestAnimationFrame(previewLoop);
