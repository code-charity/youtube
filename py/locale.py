#!/usr/bin/python
# -*- coding: utf-8 -*-

# --------------------------------------------------------------
# >>> TABLE OF CONTENTS:
# --------------------------------------------------------------
# 1.0 Import modules
# 2.0 Lower camel case
# 3.0 Get list of files
# 4.0 Add item
# 5.0 Remove item
# 6.0 Decode
# 7.0 Add locales
# 8.0 Initialization
# --------------------------------------------------------------

# --------------------------------------------------------------
# 1.0 IMPORT MODULES
# --------------------------------------------------------------

import io
import json
import os
import pathlib
import re
import sys


# --------------------------------------------------------------
# 2.0 LOWER CAMEL CASE
# --------------------------------------------------------------

def lowerCamelCase(string):
    string = re.sub(r"(-|_)+", ' ', string).title()
    string = re.sub(r"[^a-zA-Z0-9]", '', string)

    return string[0].lower() + string[1:]


# --------------------------------------------------------------
# 3.0 GET LIST OF FILES
# --------------------------------------------------------------

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


# --------------------------------------------------------------
# 4.0 ADD ITEM
# --------------------------------------------------------------

def addItem(allFiles):
    message = input('Enter your message: ')
    camelized_message = lowerCamelCase(message)

    for keyFile in allFiles:
        with open(keyFile, 'r+') as json_file:
            data = json.load(json_file)

            if (camelized_message in data) == False:
                data[camelized_message] = {'message': message}

            json_file.seek(0)
            json.dump(data, json_file, ensure_ascii=False, indent=4,
                      sort_keys=True)
            json_file.truncate()


# --------------------------------------------------------------
# 5.0 REMOVE ITEM
# --------------------------------------------------------------

def removeItem(allFiles):
    key = input('Enter your key (lowerCamelCase): ')

    for keyFile in allFiles:
        with open(keyFile, 'r+') as json_file:
            data = json.load(json_file)

            if data[key]:
                del data[key]

            json_file.seek(0)
            json.dump(data, json_file, ensure_ascii=False, indent=4,
                      sort_keys=True)
            json_file.truncate()


# --------------------------------------------------------------
# 6.0 DECODE
# --------------------------------------------------------------

def decodeCharacters(allFiles):
    for keyFile in allFiles:
        with open(keyFile, 'r+') as json_file:
            data = json.load(json_file)

            json_file.seek(0)
            json.dump(data, json_file, ensure_ascii=False, indent=4,
                      sort_keys=True)
            json_file.truncate()


# --------------------------------------------------------------
# 7.0 ADD LOCALES
# --------------------------------------------------------------

def addLocales():
    locales = [
        'am',
        'ar',
        'bg',
        'bn',
        'ca',
        'cs',
        'da',
        'de',
        'el',
        'en',
        'es',
        'et',
        'fa',
        'fi',
        'fil',
        'fr',
        'gu',
        'he',
        'hi',
        'hin',
        'hr',
        'hu',
        'id',
        'it',
        'ja',
        'kn',
        'ko',
        'lt',
        'lv',
        'ml',
        'mr',
        'ms',
        'nb_NO',
        'nl',
        'no',
        'pl',
        'pt_BR',
        'pt_PT',
        'ro',
        'ru',
        'sk',
        'sl',
        'sr',
        'sv',
        'sw',
        'ta',
        'te',
        'th',
        'tr',
        'uk',
        'vi',
        'zh_CN',
        'zh_TW'
    ]

    for locale in locales:
        if not os.path.exists('../_locales/' + locale):
            pathlib.Path('../_locales/' + locale).mkdir(parents=True,
                    exist_ok=True)

            file = io.open('../_locales/' + locale + '/messages.json',
                           mode='w', encoding='utf-8')

            file.write('{}')

            file.close()

            print(locale)


# --------------------------------------------------------------
# 8.0 INITIALIZATION
# --------------------------------------------------------------

allFiles = getListOfFiles('../_locales/')

for arg in sys.argv:
    if arg == '-add':
        addItem(allFiles)
    elif arg == '-remove':
        removeItem(allFiles)
    elif arg == '-decode':
        decodeCharacters(allFiles)
    elif arg == '-generate':
        addLocales()