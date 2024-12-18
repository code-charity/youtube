#!/usr/bin/python
# -*- coding: utf-8 -*-

#---------------------------------------------------------------
# >>> TABLE OF CONTENTS:
#---------------------------------------------------------------
# 1.0 Import modules
# 2.0 Variables and helper functions
# 3.0 Chromium
# 4.0 Firefox
# 5.0 Initialization
#---------------------------------------------------------------

#---------------------------------------------------------------
# 1.0 IMPORT MODULES
#---------------------------------------------------------------

import shutil
import argparse
import json
import os
import zipfile

#---------------------------------------------------------------
# 2.0 VARIABLES AND HELPER FUNCTIONS
#---------------------------------------------------------------

temp_path = '../tmp'

def parse_args():
    parser = argparse.ArgumentParser(
                    prog='build.py',
                    description='Build the extension for use in the browser')

    parser.add_argument('-b', '--browser', default='chromium')
    parser.add_argument('-m', '--manifest', type=int, default=3)

    return parser.parse_args()

def copy_src_to_tmp():
    if (os.path.isdir(temp_path)):
        shutil.rmtree(temp_path, ignore_errors=True)

    os.mkdir(temp_path)
    os.chdir(temp_path)

    for dst in os.listdir('../src'):
        if  dst.find('.zip') == -1:
            src = os.path.join('../src/', dst)
            if os.path.isdir(src):
                shutil.copytree(src, dst, True, None)
            else:
                shutil.copy2(src, dst)

def archive_zip(name):
    archive = zipfile.ZipFile('../' + name + '.zip', 'w', zipfile.ZIP_DEFLATED)
    for root, dirs, files in os.walk('.'):
        for file in files:
            archive.write(os.path.join(root, file),
                          os.path.relpath(os.path.join(root, file),
                                        os.path.join('.', '.')))
    archive.close()


#---------------------------------------------------------------
# 3.0 CHROMIUM
#---------------------------------------------------------------

def chromium(manifest_version):
    copy_src_to_tmp()
    if manifest_version == 2:
        shutil.copy2('../build/mv2.json', 'manifest.json')

    with open('manifest.json', 'r+') as json_file:
        data = json.load(json_file)

        version = data['version']

        json_file.seek(0)
        json.dump(data, json_file, indent=4, sort_keys=True)
        json_file.truncate()

    archive_zip('chromium-' + version)
    shutil.rmtree(temp_path)


#---------------------------------------------------------------
# 4.0 FIREFOX
#---------------------------------------------------------------

def firefox(manifest_version):
    copy_src_to_tmp()
    shutil.copy2('../build/mv3ff', 'manifest.json')

    with open('background.js', 'r') as file:
        lines = file.readlines()

    with open('background.js', 'w') as file:
        skip = False

        for pos, line in enumerate(lines):
            if (lines[pos].find('8.0 GOOGLE ANALYTICS') != -1):
                skip = True

            if (skip == False):
                file.write(line)

            if (line.find('/*--------------------------------------------------------------') != -1):
                skip = False

    with open('manifest.json', 'r+') as json_file:
        data = json.load(json_file)

        version = data['version']

        del data['content_security_policy']
        del data['update_url']

        json_file.seek(0)
        json.dump(data, json_file, indent=4, sort_keys=True)
        json_file.truncate()

    archive_zip('firefox-' + version)
    shutil.rmtree(temp_path)


#---------------------------------------------------------------
# 5.0 INITIALIZATION
#---------------------------------------------------------------

arg = parse_args()

if arg.browser == 'chromium':
    chromium(arg.manifest)
elif arg.browser == 'firefox':
    firefox(arg.manifest)
