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
        with open(keyFile, 'r+', encoding='utf-8') as json_file:
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
        with open(keyFile, 'r+', encoding='utf-8') as json_file:
            data = json.load(json_file)

            if key in data:
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
        with open(keyFile, 'r+', encoding='utf-8') as file:
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
        with open(keyFile, 'r+', encoding='utf-8') as json_file:
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
'af_ZA',
'am',
'ar',
'ar_BH',
'ar_EG',
'ar_SA',
'bg',
'bg_BG',
'bn',
'ca',
'ca_ES',
'ceb_PH',
'ch_GU',
'cs',
'cs_CZ',
'csb_PL',
'cv_CU',
'da',
'da_DK',
'de',
'de_CH',
'de_DE',
'el',
'el_CY',
'el_GR',
'en',
'en_GB',
'en_PT',
'en_US',
'eo_UY',
'es',
'es_419',
'es_ES',
'et',
'et_EE',
'fa',
'fa_IR',
'fi',
'fi_FI',
'fil',
'fil_PH',
'fj_FJ',
'fo_FO',
'fr',
'fr_BE',
'fr_CA',
'fr_CH',
'fr_FR',
'fr_LU',
'fr_QC',
'fra_DE',
'fy_NL',
'ga_IE',
'got_DE',
'gu',
'he',
'he_IL',
'hi',
'hi_IN',
'hil_PH',
'hr',
'hu',
'hu_HU',
'id',
'it',
'it_IT',
'ja',
'ja_JP',
'kab_KAB',
'kl_GL',
'kn',
'kn_IN',
'ko',
'ko_KR',
'ks_IN',
'ky_KG',
'lo_LA',
'lt',
'lv',
'mai_IN',
'me_ME',
'mg_MG',
'ml',
'ml_IN',
'mn_MN',
'moh_CA',
'mos_MOS',
'mr',
'ms',
'ms_BN',
'ms_MY',
'my_MM',
'na_NR',
'nb_NO',
'nds_DE',
'ne_IN',
'ne_NP',
'ng_NA',
'nl',
'nl_NL',
'no',
'no_NO',
'pam_PH',
'pcm_NG',
'pl',
'pl_PL',
'ps_AF',
'pt_BR',
'pt_PT',
'ro',
'ro_RO',
'ru',
'ru_RU',
'si',
'sk',
'sl',
'sr',
'sr_Cyrl_ME',
'sr_SP',
'sv',
'sv_SE',
'sw',
'ta',
'te',
'th',
'tr',
'tr_TR',
'uk',
'uk_UA',
'vi',
'vi_VN',
'vls_BE',
'zh_CN',
'zh_TW',
    ]

    if os.path.exists('../src/_locales/en/messages.json'):
        file = open('../src/_locales/en/messages.json', 'r+', encoding='utf-8')
        
        default_locale = json.load(file)

        file.close()
    else:
        default_locale = {}

    for locale in locales:
        path = '../src/_locales/' + locale

        if not os.path.exists(path):
            pathlib.Path(path).mkdir(parents=True, exist_ok=True)

            file = io.open(path + '/messages.json', mode='w', encoding='utf-8')

            json.dump(default_locale, file, ensure_ascii=False, indent=4, sort_keys=True)
            
            file.close()
        else:
            with open(path + '/messages.json', 'r+', encoding='utf-8') as file:
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

if not os.path.exists('../src/_locales/'):
    pathlib.Path('../src/_locales/').mkdir(parents=True, exist_ok=True)

allFiles = getListOfFiles('../src/_locales/')

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
