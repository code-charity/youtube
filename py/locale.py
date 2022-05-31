#!/usr/bin/python
# -*- coding: utf-8 -*-

# ------------------------------------------------------------------------------
# >>> TABLE OF CONTENTS:
# ------------------------------------------------------------------------------
# 1.0 Import modules
# 2.0 Lower camel case
# 3.0 Get list of files
# 4.0 Add item
# 5.0 Remove item
# 6.0 Change key
# 7.0 Decode
# 8.0 Upgrade
# 9.0 Initialization
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# 1.0 IMPORT MODULES
# ------------------------------------------------------------------------------

import io
import json
import os
import pathlib
import re
import sys


# ------------------------------------------------------------------------------
# 2.0 LOWER CAMEL CASE
# ------------------------------------------------------------------------------

def lowerCamelCase(string):
    string = re.sub(r"(-|_)+", ' ', string).title()
    string = re.sub(r"[^a-zA-Z0-9]", '', string)

    return string[0].lower() + string[1:]


# ------------------------------------------------------------------------------
# 3.0 GET LIST OF FILES
# ------------------------------------------------------------------------------

def getListOfFiles(path):
    allFiles = list()

    for entry in os.listdir(path):
        fullPath = os.path.join(path, entry)

        if not os.path.isdir(fullPath):
            allFiles.append(fullPath)

    for entry in os.listdir(path):
        fullPath = os.path.join(path, entry)

        if os.path.isdir(fullPath):
            allFiles = allFiles + getListOfFiles(fullPath)

    return allFiles


# ------------------------------------------------------------------------------
# 4.0 ADD ITEM
# ------------------------------------------------------------------------------

def addItem(allFiles):
    message = input('Enter your message: ')
    camelized_message = lowerCamelCase(message)

    for keyFile in allFiles:
        with open(keyFile, 'r+') as json_file:
            data = json.load(json_file)

            if (camelized_message in data) == False:
                data[camelized_message] = {'message': message}

            json_file.seek(0)
            json.dump(data, json_file, ensure_ascii=False, indent=4, sort_keys=True)
            json_file.truncate()


# ------------------------------------------------------------------------------
# 5.0 REMOVE ITEM
# ------------------------------------------------------------------------------

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


# ------------------------------------------------------------------------------
# 6.0 CHANGE KEY
# ------------------------------------------------------------------------------

def changeKey(allFiles):
    old_key = input('Enter key: ')
    new_key = input('Enter new key: ')

    for keyFile in allFiles:
        with open(keyFile, 'r+') as file:
            data = json.load(file)

            if old_key in data:
                data[new_key] = data[old_key]

                del data[old_key]

            file.seek(0)
            json.dump(data, file, ensure_ascii=False, indent=4, sort_keys=True)
            file.truncate()


# ------------------------------------------------------------------------------
# 7.0 DECODE
# ------------------------------------------------------------------------------

def decodeCharacters(allFiles):
    for keyFile in allFiles:
        with open(keyFile, 'r+') as json_file:
            data = json.load(json_file)

            json_file.seek(0)
            json.dump(data, json_file, ensure_ascii=False, indent=4,
                      sort_keys=True)
            json_file.truncate()


# ------------------------------------------------------------------------------
# 8.0 UPGRADE
# ------------------------------------------------------------------------------

def upgrade():
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

    if os.path.exists('../_locales/en/messages.json'):
        file = open('../_locales/en/messages.json', 'r+')
        
        default_locale = json.load(file)

        file.close()
    else:
        default_locale = {}

    for locale in locales:
        path = '../_locales/' + locale

        if not os.path.exists(path):
            pathlib.Path(path).mkdir(parents=True, exist_ok=True)

            file = io.open(path + '/messages.json', mode='w', encoding='utf-8')

            json.dump(default_locale, file, ensure_ascii=False, indent=4, sort_keys=True)
            
            file.close()
        else:
            with open(path + '/messages.json', 'r+') as file:
                data = json.load(file)

                file.seek(0)

                for key in default_locale:
                    if (key in data) == False:
                        data[key] = default_locale[key]

                json.dump(data, file, ensure_ascii=False, indent=4, sort_keys=True)
                
                file.truncate()

                file.close()


# ------------------------------------------------------------------------------
# 9.0 INITIALIZATION
# ------------------------------------------------------------------------------

if not os.path.exists('../_locales/'):
    pathlib.Path('../_locales/').mkdir(parents=True, exist_ok=True)

allFiles = getListOfFiles('../_locales/')

for arg in sys.argv:
    if arg == '-add':
        addItem(allFiles)
    elif arg == '-remove':
        removeItem(allFiles)
    elif arg == '-decode':
        decodeCharacters(allFiles)
    elif arg == '-change-key':
        changeKey(allFiles)
    elif arg == '-upgrade':
        upgrade()