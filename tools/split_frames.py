from PIL import Image
import numpy as np
import os
import json

parent_dir = "parrots"  # true for everyone

###only true for the first 'parrot'
working_dir = "wineparrot"
detect_color = (134, 153, 118)
offset = (5, 12)


pos_list = {}
with Image.open(os.path.join(parent_dir, working_dir, working_dir + ".gif")) as img:
    for i in range(img.n_frames):
        img.seek(i)
        im = img.copy()
        if i == 0:
            palette = im.getpalette()
        else:
            im.putpalette(palette)

        # im.convert("RGBA")
        color_to_find = im.palette.getcolor(detect_color)
        pix = np.array(im)
        first_pos_lin = np.argmax(pix.reshape(-1) == color_to_find)
        y, x = first_pos_lin // pix.shape[0], first_pos_lin % pix.shape[0]

        img_name = f"{working_dir}_{i}.png"

        pos_list[img_name] = (int(x) + offset[0], int(y) + offset[1])
with Image.open(os.path.join(parent_dir, working_dir, working_dir + ".gif")) as img:
    palette = img.getpalette()
    for i in range(img.n_frames):
        img.seek(i)
        im = img.copy()
        im.putpalette(palette)
        # transparency = im.info['transparency']
        # print(transparency)
        img_name = f"{working_dir}_{i}.png"
        im.save(os.path.join(parent_dir, working_dir, img_name), "PNG")
print(pos_list)
with open(os.path.join(parent_dir, working_dir, "location.json"), "w") as f:
    json.dump(pos_list, f)
