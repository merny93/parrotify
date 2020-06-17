from flask import Flask, request, jsonify, render_template, send_file, Response, make_response, url_for, send_from_directory
from flask_cors import CORS
from tempfile import NamedTemporaryFile
from shutil import copyfileobj
from os import remove
# Reading an animated GIF file using Python Image Processing Library - Pillow
from io import StringIO
from PIL import Image

from PIL import GifImagePlugin

import numpy as np
 
import sys

from facenet_pytorch import MTCNN
import cv2 as cv

# Add support for interpreting common web types without relying on system registry
import mimetypes
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("text/javascript", ".js")

app = Flask(__name__)
CORS(app)

mtcnn = MTCNN(keep_all=True, device='cpu')

imageObject = Image.open("parrot.gif")
# nameExt = str(sys.argv[1])
# file_name = "faces/"+nameExt


#  if (req.file.size === MAX_SIZE) {
#       try {
#         fs.unlink(req.file.path, (err) => {});
#       } catch {}
#       res.status(400).send("File too big. Max size: 3MB");
#       return;
#     }

@app.route('/')
def splash():
    return render_template('index.html')


@app.route('/parrotify', methods=['POST'])
def parrotify():
    if not request.files:
        return False    
    image = request.files["image"]
    nameExt = image.filename
    face = Image.open(image)
    #im = cv.imread(image)
    boxes, _ = mtcnn.detect(face)

    try:
        box = boxes[0].tolist()
    except:
        print("no face found")
        exit(0)

    face = face.crop(tuple([box[x] for x in range(4)]))
    face_mask = np.ones(face.size, dtype=np.uint8) *250


    def elipse(x,y,s):
        return ((x-(s[0]/2))**2)/((s[0]/2)**2) + ((y-(s[1]/2))**2)/((s[1]/2)**2) 

    for x, col in enumerate(face_mask):
        for y, val in enumerate(col):

            if elipse(x,y,np.shape(face_mask)) < 1:
                face_mask[x,y] = 250
            else:
                face_mask[x,y] = 0

    face_mask = Image.fromarray(face_mask, "L")


    size= imageObject.size
    new_size = [int(0.6 * x) for x in size]

    face = face.resize(tuple(new_size), Image.ANTIALIAS)
    face_mask = face_mask.resize(tuple(new_size), Image.ANTIALIAS)


    face = face.convert("RGBA")


    def pos_to_pix(pos,size):
        return (pos%size[0],int(np.floor(pos/size[1])))

    # find the nose
    background=[]
    for frame in range(0, imageObject.n_frames):

        imageObject.seek(frame)
        background.append(imageObject.convert("RGBA"))
        pixs = imageObject.getdata(0)
        pos = 0

        for index, pix in enumerate(pixs):
            if pix == 195:
                pos = index
                break
        nose_pos = pos_to_pix(pos, size)
        new_pos = [nose_pos[x] - new_size[x]//2 for x in range(2)]
        new_pos[1] += 10
        background[frame].paste(face, new_pos, face_mask)


        
        datas = background[frame].getdata()

        newData = []
        for item in datas:
            if item[0] == 255 and item[1] == 255 and item[2] == 255:
                newData.append((255, 255, 255, 255))
            else:
                newData.append(item)

        background[frame].putdata(newData)

    # img_io = StringIO()
    # print(type(img_io))     
    # background[0].save(img_io,format="GIF") #save_all = True, append_images = [background[x] for x in range(imageObject.n_frames)])
    # img_io.seek(0)

    tempFileObj = NamedTemporaryFile(mode='w+b',suffix='gif')
    background[0].save(tempFileObj, format = 'GIF', save_all = True, append_images = [background[x] for x in range(imageObject.n_frames)])
    tempFileObj.seek(0,0)
    background[0].save('test.gif', format = 'GIF', save_all = True, append_images = [background[x] for x in range(imageObject.n_frames)])
    print("saved as: " + 'out/'+nameExt.split('.')[0]+'.gif')
    return send_file(tempFileObj, mimetype='image/gif')

# running REST interface, port=5000 for direct test, port=5001 for deployment from PM2
if __name__ == "__main__":
    app.run(debug=True, port=5000)

@app.route("/getParrotNoseCoords")
def getNoseCoords():
    return jsonify([1,2,3,4])

@app.route("/getParrotGIF")
def getParrotGIF():
    response = make_response(send_file("static/parrot.gif", mimetype='image/gif'))
    return response


@app.route("/test1")
def test1():
    response = make_response(send_file("static/test.jpg", mimetype='image/jpg'))
    return response

@app.route("/getParrotNoseFrames")
def getParrotNoseFrames():
    return 

# @app.route('/getParrotGIF')
# def getParrotGIF():
#     response = Response(response= , status=200, mimetype='application/octet-stream' )

# @app.route('/getParrotFrames')
# def getParrotFrames

# Get the parrot gif frames from the server. Server decomposes gif into frames each time.
@app.route('/getParrot')
def getParrot():
    def pos_to_pix(pos,size):
        return (pos%size[0],int(np.floor(pos/size[1])))
    
    imageObject = Image.open('parrot.gif')
    size= imageObject.size
    background=[]
    for frame in range(imageObject.n_frames):
        imageObject.seek(frame)
        
        temp_image = imageObject.convert("RGBA")
        datas = temp_image.getdata()

        newData = []
        for item in datas:
            if item[0] == 255 and item[1] == 255 and item[2] == 255:
                newData.append((255, 255, 255, 255))
            else:
                newData.append(item)

        temp_image.putdata(newData)
        current_image = np.array(temp_image.getdata()).flatten().tolist()
        pixs = imageObject.getdata(0)
        pos = 0

        for index, pix in enumerate(pixs):
            if pix == 195:
                pos = index
                break
        nose_pos = pos_to_pix(pos, size)
        #new_pos = [nose_pos[x] - new_size[x]//2 for x in range(2)]
        #new_pos[1] += 10
        parrot_position = {
            "image": current_image,
            "position": nose_pos
        }
        background.append(parrot_position)
        # background[frame].paste(face, new_pos, face_mask)
    return jsonify(background)


        # dict = {
        #     'avc' : 'nope'
        # } 
        # dict["key"] = 'value'

@app.route('/getParrot2')
def getParrot2():
    imageObject = Image.open('parrot.gif')
    background=[]
    for frame in range(1):#range(imageObject.n_frames):
        imageObject.seek(frame)

        background.append(np.array(imageObject.convert("RGBA").getdata()).flatten())
        pixs = imageObject.getdata(0)

        for index, pix in enumerate(pixs):
            if pix == 195:
                pos = index
                break
        # nose_pos = pos_to_pix(pos, size)
        # new_pos = [nose_pos[x] - new_size[x]//2 for x in range(2)]
        # new_pos[1] += 10
        # background[frame].paste(face, new_pos, face_mask)
    
    response = Response( response = background[0].tobytes(), status=200, mimetype="application/octet-stream")
    # response.headers.set('Content-Type', 'appication/octet-stream')
    response.headers["what"] = "thefuck"

    return response