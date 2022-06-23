

console.log("hnlooos");



function updateImage(e){
    let file = e.files[0];
    imgObj = URL.createObjectURL(file);
    document.getElementById('myImage').src = imgObj;
}

async function findFace(){
    // await faceapi.nets.tinyFaceDetector.loadFromUri('/models'); //tinny model works terribly
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models'); //big model works very frikken well!

    console.log('loaded model');

    const input = document.getElementById("myImage");
    const canvas = document.getElementById("myCanvas");
    
    let context = canvas.getContext("2d");


    const detection = await faceapi.detectSingleFace(input);
    console.log(detection);
    console.log(detection.box);
    // canvas.width = detection.box.width; 
    // canvas.height = detection.box.height;
    canvas.width = 100;

    //get the parrots
    canvas.height = detection.box.height/detection.box.width * 100;
    let parrotDir = await readJSON('parrots/parrot/location.json')
    console.log(parrotDir);

    let gif = new GIF({
        workers: 2,
        quality: 10,
        transparent: '#000'
    });
    //load a parrot
    for (frame in parrotDir){
        let img = await loadImage('parrots/parrot/' + frame);
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // context.drawImage(img,0,0);
        //overdraw the person face
        const overdraw = 1.5;
        let offset = parrotDir[frame];
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


        interContext.drawImage(input,faceX,faceY, faceWidth, faceHeight, 0,0,faceSizeX,faceSizeY);

        interContext.restore();

        
        // interContext.fill()
        document.body.appendChild(interCanvas);

        context.drawImage(img,0,0);
        context.drawImage(interCanvas,xOffset - (faceSizeX/2), yOffset-(faceSizeY/2),faceSizeX,faceSizeY);
        gif.addFrame(canvas, {copy: true, delay:40});

        

    }
    gif.on('finished', function(blob) {
        window.open(URL.createObjectURL(blob));
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
// do_thing();


//stollen or something
function loadImage(url) {
    return new Promise(r => { let i = new Image(); i.onload = (() => r(i)); i.src = url; });
  }

//basically os.path.join
buildPath = (...args) => {
    return args.map((part, i) => {
      if (i === 0) {
        return part.trim().replace(/[\/]*$/g, '')
      } else {
        return part.trim().replace(/(^[\/]*|[\/]*$)/g, '')
      }
    }).filter(x=>x.length).join('/')
  }