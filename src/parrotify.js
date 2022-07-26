/* Load and prime the face detector model*/
async function loadAndPrimeModel(){
  // await faceapi.nets.tinyFaceDetector.loadFromUri('/models'); //tinny model works terribly
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/src/libs/models'); //big model works very frikken well!
  console.log('done loading model');
  //now run a face through
  let primeImage = new Image();
  primeImage.src = "src/static/primeFace.jfif"
  primeImage.onload =async function(){
    const detection = await faceapi.detectSingleFace(primeImage);
    console.log('done prime detection');
  }

}

/* load the parrot frames
Puts into a map of (image, noselocation) in correct order
read using map.foreach(value,key)
*/
async function loadParrot(loc){
  let parrotDir = await readJSON(loc + 'location.json')
  let parrotPics = new Map();
  for (frame in parrotDir){
    let img = await loadImage(loc + frame);
    parrotPics.set(img, parrotDir[frame]);
  }
  return parrotPics;

}

//load model this takes a while so spawn a thread that does it
loadAndPrimeModel();
//load parrot
let parrotMap = loadParrot('parrots/parrot/');


async function parrotifyFace(imgSRC){
    const canvas =  document.createElement('canvas')
    
    let context = canvas.getContext("2d");


    const detection = await faceapi.detectSingleFace(imgSRC);
    console.log("done detection")

    canvas.width = 1024;

    //get the parrots
    canvas.height = detection.box.height/detection.box.width * 1024;
    // let parrotDir = await readJSON('parrots/parrot/location.json')
    // console.log(parrotDir);

    let gif = new GIF({
        workers: 2,
        quality: 10,
        transparent: '#000'
    });

    (await parrotMap).forEach((offset, img) => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        //overdraw the person face
        const overdraw = 1.5;

        //select the right spot to copy
        let xOffset = offset[0];
        let yOffset = offset[1];
        let faceWidth = detection.box.width*overdraw;
        let faceHeight = detection.box.height*overdraw;
        let faceX = detection.box.x + faceWidth*(1-overdraw)/(2*overdraw);
        let faceY = detection.box.y + faceHeight*(1-overdraw)/(2*overdraw);
        let faceSizeX = canvas.width/1.6;
        let faceSizeY = faceHeight/faceWidth*faceSizeX

        const interCanvas = document.createElement('canvas');
        interCanvas.width = faceSizeX;
        interCanvas.height = faceSizeY;
        const interContext = interCanvas.getContext('2d');

        
        interContext.fillStyle = "rgba(0,0,0,0)";
        interContext.fillRect(0,0,faceSizeX,faceSizeY);
        interContext.fill();
        interContext.save();
        let scale = faceSizeX/faceSizeY;
        interContext.scale(scale,1);

        interContext.beginPath();
        interContext.arc(faceSizeX/2/scale, faceSizeY/2, Math.min(faceSizeX/2/scale, faceSizeY/2*scale), 0, Math.PI * 2, true);
        interContext.closePath();
        interContext.clip();
        interContext.scale(1/scale,1);


        interContext.drawImage(imgSRC,faceX,faceY, faceWidth, faceHeight, 0,0,faceSizeX,faceSizeY);

        interContext.restore();

        context.drawImage(img,0,0);
        context.drawImage(interCanvas,xOffset - (faceSizeX/2), yOffset-(faceSizeY/2),faceSizeX,faceSizeY);
        gif.addFrame(canvas, {copy: true, delay:40});

        

    });
    gif.on('finished', function(blob) {
        // window.open(URL.createObjectURL(blob)); //open in a new window
        displayGIF(blob);
    });

    gif.render();
    console.log("done");
    // context.drawImage(input, 0,0,0,0,canvas.width, canvas.height);

}

async function readJSON(loc){
    let rawContent = await fetch(loc);
    let res = await rawContent.json();
    return res;
}

//stollen or something
function loadImage(url) {
    return new Promise(r => { let i = new Image(); i.onload = (() => r(i)); i.src = url; });
  }
