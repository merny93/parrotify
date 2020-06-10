
# Reading an animated GIF file using Python Image Processing Library - Pillow

from PIL import Image

from PIL import GifImagePlugin

import numpy as np
 
import sys

from facenet_pytorch import MTCNN
import cv2 as cv




mtcnn = MTCNN(keep_all=True, device='cpu')

imageObject = Image.open("parrot.gif")
nameExt = str(sys.argv[1])
file_name = "faces/"+nameExt
face = Image.open(file_name)


im = cv.imread(file_name)
boxes, _ = mtcnn.detect(im)



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
new_size = [int(0.5 * x) for x in size]

face = face.resize(tuple(new_size), Image.ANTIALIAS)
face_mask = face_mask.resize(tuple(new_size), Image.ANTIALIAS)




# face_mask = face.convert("L")

# def threshold(val):
#     if val > 250:
#         return 0
#     else: 
#         return 253 

# face_mask = face_mask.point(threshold)
# face_mask = face_mask.convert("1")


face = face.convert("RGB")


def pos_to_pix(pos,size):
   return (pos%size[0],int(np.floor(pos/size[1])))

# find the nose
background=[]
for frame in range(0, imageObject.n_frames):

    imageObject.seek(frame)
    background.append(imageObject.convert())
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





background[0].save('out/'+nameExt.split('.')[0]+'.gif', save_all = True, append_images = [background[x] for x in range(imageObject.n_frames)])
print("saved as: " + 'out/'+nameExt.split('.')[0]+'.gif' )
