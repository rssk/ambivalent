const LifxClient = require('lifx-lan-client').Client;
const { DesktopDuplication } = require('windows-desktop-duplication');
const { spawn } = require('child_process');
const ffmpegBin = require('@ffmpeg-installer/ffmpeg').path;

process.on('uncaughtException', function (exception) {
  console.log(exception);
});
process.on('unhandledRejection', (reason, p) => {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

const client = new LifxClient();
let tv;
client.on('light-new', function(light) {
  light.getState((e, d) => {
    if(e) return console.error(e);
    if(d && d.label === 'TV') {
      light.on();
      tv = light;
    }
  });
});
client.init();
let ffmpeg = spawn(ffmpegBin,[
//  '-f',
//  'avfoundation',
//  '-i',
//  '1',
'-f',
 'gdigrab',
   '-i',
 'desktop',
 '-vf',
 'scale=1:1',
 '-r',
 '30',
 '-f',
 'rawvideo',
 '-pix_fmt',
 'rgba',
 'pipe:1'
]);

let lock = false;
let offset = 50;
ffmpeg.stdout.on('data', (frame) => {
  // process.stdout.write(`${(Date.now() - start)/1000/60} \n`);
  // let rgb = [0, 0, 0];
  // let i;
  // for (i = 0; i < frame.data.length; i+=4) {
  //   rgb[0] += frame.data[i];
  //   rgb[1] += frame.data[i + 1];
  //   rgb[2] += frame.data[i + 2];  
  // }
  // rgb = rgb.map((pix) => Math.round(pix/(i/4)));
  if (tv && !lock) {
    lock = true;
    tv.colorRgb(
      Math.min(frame[0] + offset, 255), 
      Math.min(frame[1] + offset, 255), 
      Math.min(frame[2] + offset, 255),
      100, 
      () => { lock = false; }
      );
  }
});

// error logging
ffmpeg.stderr.setEncoding('utf8');
ffmpeg.stderr.on('data', (data) => {
//  console.log(data);
});



// let dd = new DesktopDuplication(0);

// try {
// 	dd.initialize();
// } catch(err) {
// 	console.log('An error occured:', err.message);
// 	process.exit(0);
// }

// dd.startAutoCapture(50);

 
// const start = Date.now();
// dd.on('frame', frame => {
//   process.stdout.write(`${(Date.now() - start)/1000/60} \n`);
//   let rgb = [0, 0, 0];
//   let i;
//   for (i = 0; i < frame.data.length; i+=4) {
//     rgb[0] += frame.data[i];
//     rgb[1] += frame.data[i + 1];
//     rgb[2] += frame.data[i + 2];  
//   }
//   rgb = rgb.map((pix) => Math.round(pix/(i/4)));
//   if (tv && !lock) {
//     lock = true;
//     tv.colorRgb(Math.min(rgb[0] + offset, 255), Math.min(rgb[1] + offset, 255), Math.min(rgb[2] + offset, 255), 100, () => { lock = false; });
//   }

// });