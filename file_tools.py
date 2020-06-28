import uuid
import csv
import time
import os


def generate_resource_id():
    """Create a unique id string for a resource
    @return: string uuid"""
    return str(uuid.uuid1()) 


def save_new_gif(uuid):
    """
        Saves a new gif uuid with its associated expiration time
    """
    DEF_EXPIRATION = 86400 ##1 day in seconds

    now_time = int(time.time())

    gif_info = {
        'uuid' : uuid,
        'exp_time': now_time + DEF_EXPIRATION
    }

    with open('gif_data.csv', 'a+', newline='') as csvfile:
        fieldNames = ['uuid', 'exp_time']
        writer = csv.DictWriter(csvfile, fieldnames = fieldNames)
        writer.writerow(gif_info)

def re_init_data():
    """
        Will delete the contents of the csv and will delete the contents of raw_gif
    """
    SHARE_DIR = "raw_gif"

    files = os.listdir(os.path.join(os.path.dirname(os.path.realpath(__file__)), SHARE_DIR))
    for file in files:
        os.remove(file)
    
    with open('gif_data.csv', 'w', newline='') as csvfile:
        fieldNames = ['uuid', 'exp_time']
        writer = csv.DictWriter(csvfile, fieldnames=fieldNames)
        writer.writeheader()