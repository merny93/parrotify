from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS
from flask_api import status
# Reading an animated GIF file using Python Image Processing Library - Pillow
from PIL import Image

from io import BytesIO

import numpy as np


from facenet_pytorch import MTCNN
import cv2 as cv

from markupsafe import escape

# Add support for interpreting common web types without relying on system registry
import mimetypes
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("text/javascript", ".js")

app = Flask(__name__)
CORS(app)

mtcnn = MTCNN(keep_all=True, device='cpu')

imageObject = Image.open("parrot.gif")


@app.route('/')
def splash():
    return render_template('index.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.route('/share/<image_id>')
def get_shared_image(image_id):
    return escape(image_id)

@app.route('/parrotify', methods=['POST'])
def parrotify():
    try:
        if not request.files:
            return jsonify("No file received"), status.HTTP_500_INTERNAL_SERVER_ERROR
        image = request.files['image']
        file_type = image.mimetype.split("/")[-1].lower()
        good_files = ['jpg', 'jpeg','jpe','jif','jfif','jfi', 'png', 'heic', 'webp', 'tiff', 'tif', 'heif']
        if file_type not in good_files:
            return jsonify("Unsupported file type"), status.HTTP_500_INTERNAL_SERVER_ERROR
        #nameExt = image.filename
        try:
            face = Image.open(image)
        except:
            return jsonify("Failed to opoen image"), status.HTTP_500_INTERNAL_SERVER_ERROR
        face_size = face.size
        pix_count = face_size[0] * face_size[1]
        scale = np.sqrt(10e3 / pix_count)
        low_res_face = face.resize((int(face_size[0]*scale),int(face_size[1]*scale)), Image.ANTIALIAS)
        #face_stretch = [face_size[0]*scale, face_size[1]*scale]
        #im = cv.imread(image)
        boxes, _ = mtcnn.detect(low_res_face)

        try:
            box = boxes[0].tolist()
        except:
            return "No fave found", status.HTTP_500_INTERNAL_SERVER_ERROR
        
        face = face.crop(tuple([int(box[x]/scale) for x in range(4)]))
        size= imageObject.size
        new_size = [int(0.6 * x) for x in size]

        face = face.resize(tuple(new_size), Image.ANTIALIAS)

        face_mask = np.ones(face.size, dtype=np.uint8)*255
        
        def elipse(x,y,s):
            return ((x-(s[0]/2))**2)/((s[0]/2)**2) + ((y-(s[1]/2))**2)/((s[1]/2)**2) 

        for x, col in enumerate(face_mask):
            for y, val in enumerate(col):

                if elipse(x,y,np.shape(face_mask)) < 1:
                    face_mask[x,y] = 255
                else:
                    face_mask[x,y] = 0

        face_mask = Image.fromarray(face_mask, "L")
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

            ##turn to RGBA to make transparancy posssilbe
            background[frame] = background[frame].convert("RGBA")
            datas = background[frame].getdata()

            ##set the white to transparent black
            newData = []
            for item in datas:
                if item[0] == 255 and item[1] == 255 and item[2] == 255:
                    newData.append((0, 0, 0, 0))
                else:
                    newData.append(item)
            background[frame].putdata(newData)

            ##get transparancy layer
            alpha = background[frame].getchannel('A')

            ##turn the rest RGB only using 254 colors leaving one color for transparancy
            background[frame] = background[frame].convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=255)

            #paste in the transparancy layer
            mask = Image.eval(alpha, lambda a: 255 if a <=128 else 0)
            background[frame].paste(255, mask)
            ##tell it what the transparancy layer is
            background[frame].info['transparency'] = 255


        #############################
        ### DO BYTESIO STUFF HERE ###
        #############################
        # tempFileObj = NamedTemporaryFile(mode='w+b',suffix='gif')
        bytesObject = BytesIO()
        background[0].save(
                bytesObject,
                # set duration maybe?
                format = 'GIF',
                save_all = True,
                disposal=2,
                append_images = background[1:] ) # [backgro   und[x] for x in range(imageObject.n_frames)])
        bytesObject.seek(0,0)


        # background[0].save('test.gif', format = 'GIF', save_all = True, append_images = [background[x] for x in range(imageObject.n_frames)])
        # print("saved as: " + 'out/'+nameExt.split('.')[0]+'.gif')

        return send_file(bytesObject, attachment_filename= "namey.gif", mimetype='image/gif', as_attachment=True)
    except:
        return "Really bad error (have no clue what went wront but it did.", status.HTTP_500_INTERNAL_SERVER_ERROR

# running REST interface, port=5000 for direct test, port=5001 for deployment from PM2
if __name__ == "__main__":
    app.run(debug=False, port=5000)


