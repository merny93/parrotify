""" Seperate out PIL image processing """
from PIL import Image

from facenet_pytorch import MTCNN

import numpy as np


mtcnn = MTCNN(keep_all=True, device='cpu', select_largest=True)

def unpack_image(image_object):
    """
        takes the request.files['image'] and turns it into a pillow Image object safely
        
        :param <wrk.weirdthing> image_object: a FileStorage image object  
        :return: a Pillow object or raises exception  
    """
    file_type = image_object.mimetype.split("/")[-1].lower()
    good_files = ['jpg', 'jpeg','jpe','jif','jfif','jfi', 'png', 'heic', 'webp', 'tiff', 'tif', 'heif']
    
    if file_type not in good_files:
        raise Exception("Unsupported file type")
    
    try:
        face = Image.open(image_object)
    except:
        raise Exception("Failed to open image")
    return face

def crop_face(face, image_object):
    """
        Crops face out of picture and resizes to gif size
        face: pillow image object of uploaded face picture
        image_object: gif to get its size
        returns cropped face
        raises exception if no face found
    """
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
        raise Exception("No fave found")
    
    face = face.crop(tuple([int(box[x]/scale) for x in range(4)]))
    size= image_object.size
    new_size = [int(0.6 * x) for x in size]

    face = face.resize(tuple(new_size), Image.ANTIALIAS)
    face = face.convert("RGBA")
    return face


def make_mask(face):
    """
    makes a circular mask for overlaying on face  
    face: pillow image object of face to overlay mask  
    returns: pillow image object (L) representing masked and unmasked things  
    """
    face_mask = np.ones(face.size, dtype=np.uint8)*255
    elipse = lambda x,y,s : ((x-(s[0]/2))**2)/((s[0]/2)**2) + ((y-(s[1]/2))**2)/((s[1]/2)**2) 

    for x, col in enumerate(face_mask):
            for y, val in enumerate(col):
                if elipse(x,y,np.shape(face_mask)) < 1:
                    face_mask[x,y] = 255
                else:
                    face_mask[x,y] = 0
    face_mask = Image.fromarray(face_mask, "L")
    return face_mask

def find_nose(parrot, new_size):
    """
    Finds the position to place face in the gif by searching for nose color  
    parrot: PPillow image object of parrot (not gif, single frame)  
    new_size: size of face (to find its center)  
    returns: array position  
    """
    size = parrot.size
    pixs = parrot.getdata(0)
    pos =0

    for index, pix in enumerate(pixs):
        if pix == 195:
            pos = index
            break
    
    pos_to_pix = lambda pos, size: (pos%size[0],int(np.floor(pos/size[1])))

    nose_pos = pos_to_pix(pos, size)
    new_pos = [nose_pos[x] - new_size[x]//2 for x in range(2)]
    new_pos[1] += 10

    return new_pos

def transparentify(frame):
    """
        Some spicy code to transparify the gif  
        Uses an unused color as a transparency  mask  
        Requires disposal=2 for the save :)
        frame: the pillow image object to transparentify
        returns transparent frame
    """
     ##turn to RGBA to make transparancy posssilbe
    frame = frame.convert("RGBA")
    datas = frame.getdata()

    ##set the white to transparent black
    newData = []
    for item in datas:
        if item[0] == 255 and item[1] == 255 and item[2] == 255:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)
    frame.putdata(newData)

    ##get transparancy layer
    alpha = frame.getchannel('A')

    ##turn the rest RGB only using 254 colors leaving one color for transparancy
    frame = frame.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=255)

    #paste in the transparancy layer
    mask = Image.eval(alpha, lambda a: 255 if a <=128 else 0)
    frame.paste(255, mask)
    ##tell it what the transparancy layer is
    frame.info['transparency'] = 255
    return frame



def make_parrot(image_object):
    """
    Call all child methods to create the parrot gif. 
    
    :param werkzeug.datastructures.FileStorage: raw image from form. 
    :return: array of PIL images representing final gif

    save with gif[0].save( <filename> ,save_all=True, disposal =2 ,append_image = gif[1:])
    """
    face = unpack_image(image_object)
    
    parrot = Image.open("parrot.gif")


    cropped_face = crop_face(face,parrot)


    face_mask = make_mask(cropped_face)

    gif = []
    for frame in range(parrot.n_frames):
        parrot.seek(frame)
        gif.append(parrot.convert("RGBA"))
        nose_pos = find_nose(parrot,cropped_face.size)

        gif[frame].paste(cropped_face,nose_pos, face_mask)
        gif[frame] = transparentify(gif[frame])

    return gif
