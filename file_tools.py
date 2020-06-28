import uuid
import csv
import time
import os

FILE_NAME = 'gif_data.csv'


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

    with open( FILE_NAME, 'a+', newline='') as csvfile:
        fieldNames = ['uuid', 'exp_time']
        writer = csv.DictWriter(csvfile, fieldnames = fieldNames)
        writer.writerow(gif_info)

def re_init_data():
    """
        Will delete the contents of the csv and will delete the contents of raw_gif
    """
    SHARE_DIR = "raw_gif"
    dir_to = os.path.join(os.path.dirname(os.path.realpath(__file__)),SHARE_DIR)
    files = os.listdir(dir_to)
    for file in files[1:]:
        os.remove(os.path.join(dir_to,file))
    
    with open( FILE_NAME, 'w', newline='') as csvfile:
        fieldNames = ['uuid', 'exp_time']
        writer = csv.DictWriter(csvfile, fieldnames=fieldNames)
        writer.writeheader()




def gif_manager():
    """
        Will go through the gif_data.csv file and check which gifs have expired
        Will also delete the oldest files if the quantity exceed MAX_QUNATITY
        uses a temp file named temp.csv which it then overwrites to gif_data.csv
    """
    current_time = int(time.time())
    SHARE_DIR = "raw_gif"
    dir_to = os.path.join(os.path.dirname(os.path.realpath(__file__)),SHARE_DIR)
    MAX_QUANTITY = 1000
    quantity = 0
    with open( 'temp.csv', 'w', newline='') as tempcsv:
        with open( FILE_NAME, 'r', newline='') as csvfile:
            fieldNames = ['uuid', 'exp_time']
            reader = csv.DictReader(csvfile)
            writer = csv.DictWriter(tempcsv, fieldnames=fieldNames)
            writer.writeheader()
            for row in reader:
                if (int(row[fieldNames[1]]) < current_time): #delet it
                    os.remove(os.path.join(dir_to, row[fieldNames[0]]))
                else: ##keep it
                    writer.writerow(row)
                    quantity += 1     
    if (quantity < MAX_QUANTITY):
        ##great we are done
        os.remove(FILE_NAME)
        os.rename('temp.csv', FILE_NAME)
        return "happiess noises"

    ## if we got here we gotta do a bigger purge
    with open( 'temp.csv', 'w', newline='') as tempcsv:
        with open( FILE_NAME, 'r', newline='') as csvfile:
            fieldNames = ['uuid', 'exp_time']
            reader = csv.DictReader(csvfile)
            writer = csv.DictWriter(tempcsv, fieldnames=fieldNames)
            writer.writeheader()
            for row_num, row in enumerate(reader):
                if (row_num < (quantity - MAX_QUANTITY)): #delete firt offenders
                    os.remove(os.path.join(dir_to, row[fieldNames[0]]))
                else: ##keep the rest
                    writer.writerow(row)   
    ##great we are done
    os.remove(FILE_NAME)
    os.rename('temp.csv', FILE_NAME)
    return "tought times"



if __name__ == "__main__":
    ##reset the whole data base
    #re_init_data()
    gif_manager()