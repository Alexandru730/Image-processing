// Matricea de ponderi pentru detecția marginilor
const edgeDetectionMatrix = [-1, -1, -1, -1, 8, -1, -1, -1, -1];

// Obține referința către canvas și contextul său 2D
const canvas = document.getElementById("dogCanvas");
const context = canvas.getContext("2d");

// Funcție asincronă pentru a prelua o imagine aleatorie de la API-ul Dog
async function fetchImage() {
  try {
    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error("Error fetching dog image:", error);
    throw error;
  }
}

// Funcție pentru afișarea datelor JSON într-un element HTML
function displayJSON(data) {
  document.getElementById("json-output").innerText = JSON.stringify(
    data,
    null,
    2
  );
}

// Funcție care aplică atât efectul de mirror, cât și detecția marginilor
function applyMirrorAndEdgeDetection(image) {
  // Afișează datele JSON
  displayJSON({ imageUrl: image.src });

  // Aplică mirror și detecția marginilor după 1 secundă
  setTimeout(() => {
    console.time("Execution Time - Mirror and Edge Detection");

    // Aplică efectul de mirror
    context.scale(-1, 1);
    context.drawImage(image, -canvas.width, 0);
    context.scale(-1, 1); // Resetare scalare

    // Aplică detecția marginilor
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const output = convolute(imageData, edgeDetectionMatrix);
    context.putImageData(output, 0, 0);

    console.timeEnd("Execution Time - Mirror and Edge Detection");

    // Înregistrează și afișează timpul de execuție după 1 secundă
    const executionTime = performance.now() - startTime;
    document.getElementById(
      "execution-time"
    ).innerText = `Execution Time: ${executionTime.toFixed(2)} ms`;
  }, 1000);
}

// Funcție de convoluție aplicată pe o imagine
function convolute(pixels, weights) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side / 2);
  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;

  var w = sw;
  var h = sh;
  var output = context.createImageData(w, h);
  var dst = output.data;

  var alphaFac = 1;
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y * w + x) * 4;

      var r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (var cy = 0; cy < side; cy++) {
        for (var cx = 0; cx < side; cx++) {
          var scy = sy + cy - halfSide;
          var scx = sx + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = (scy * sw + scx) * 4;
            var wt = weights[cy * side + cx];
            r += src[srcOff] * wt;
            g += src[srcOff + 1] * wt;
            b += src[srcOff + 2] * wt;
            a += src[srcOff + 3] * wt;
          }
        }
      }
      dst[dstOff] = r;
      dst[dstOff + 1] = g;
      dst[dstOff + 2] = b;
      dst[dstOff + 3] = a + alphaFac * (255 - a);
    }
  }
  return output;
}

let startTime; // Variabilă pentru a stoca timpul de start

// Funcție care procesează imaginea
async function processImage() {
  const imageUrl = await fetchImage();
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imageUrl;

  image.onload = function () {
    // Afișează imaginea originală
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Stochează timpul de start
    startTime = performance.now();

    // Aplică procesarea
    applyMirrorAndEdgeDetection(image);
  };
}

// Inițializare la încărcarea paginii
processImage();
