# TODO: reduce script length

import json
import os
import pathlib
import re

def lowerCamelCase(string):
    string = re.sub(r"(-|_)+", " ", string).title().replace(" ", "")
    
    return string[0].lower() + string[1:]

def getListOfFiles(dirName):
    allFiles = list()

    for entry in os.listdir(dirName):
        fullPath = os.path.join(dirName, entry)

        if not os.path.isdir(fullPath):
            allFiles.append(fullPath)

    for entry in os.listdir(dirName):
        fullPath = os.path.join(dirName, entry)

        if os.path.isdir(fullPath):
            allFiles = allFiles + getListOfFiles(fullPath)

    return allFiles

def addItem(allFiles):
    message = input("Enter your message: ")
    
    for keyFile in allFiles:
        with open(keyFile, "r+") as json_file:
            data = json.load(json_file)
            
            data[lowerCamelCase(message)] = {
                "message": message
            }
            
            json_file.seek(0)
            json.dump(data, json_file, indent=4)
            json_file.truncate()

def removeItem(allFiles):
    key = input("Enter your key (lowerCamelCase): ")
    
    for keyFile in allFiles:
        with open(keyFile, "r+") as json_file:
            data = json.load(json_file)
            
            if data[key]:
                del data[key]
            
            json_file.seek(0)
            json.dump(data, json_file, indent=4)
            json_file.truncate()

allFiles = getListOfFiles("_locales/")

operation = input("""--------------------------------
Add item: 1
Remove item: 2
--------------------------------

Enter number: """)

if operation == "1":
    addItem(allFiles)
elif operation == "2" :
    removeItem(allFiles)
