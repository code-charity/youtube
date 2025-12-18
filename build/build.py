#!/usr/bin/python
# -*- coding: utf-8 -*-

#---------------------------------------------------------------
# >>> TABLE OF CONTENTS:
#---------------------------------------------------------------
# 1.0 Import modules
# 2.0 Chromium
# 3.0 Firefox
# 4.0 Initialization
#---------------------------------------------------------------

#---------------------------------------------------------------
# 1.0 IMPORT MODULES
#---------------------------------------------------------------

import shutil
import sys
import json
import os
import zipfile
import re
#import pathlib

#---------------------------------------------------------------
# Helpers
#---------------------------------------------------------------

EXCLUDE_TOP_LEVEL = {
    'tests',
    'jest.config.js',
    'package-lock.json',
    'package.json',
    'README.md',
    'LICENSE',
    'CONTRIBUTING.md'
}

def _sanitize_name_for_store(name, store):
    # remove non-ASCII (simple emoji removal) and replace single quote with '*' for Edge/Whale
    sanitized = re.sub(r'[^\x00-\x7F]+', '', name or '')
    if store in ('edge', 'whale'):
        sanitized = sanitized.replace("'", "*")
    return sanitized

#---------------------------------------------------------------
# 2.0 CHROMIUM
#---------------------------------------------------------------

def chromium(browser):
    temporary_path = '../cached'

    if os.path.isdir(temporary_path):
        shutil.rmtree(temporary_path, ignore_errors=True)

    os.mkdir(temporary_path)

    for item in os.listdir('../'):
        if (
            item != '.git' and
            item != '.github' and
            item != 'cached' and
            item != 'previews' and
            item != 'py' and
            item != 'wiki' and
            item != 'LICENSE' and
            item != 'README.md' and
            item != 'SECURITY.md' and
            item.find('.zip') == -1
        ):
            if item in EXCLUDE_TOP_LEVEL:
                continue
            s = os.path.join('.', item)
            d = os.path.join(temporary_path, item)
            if os.path.isdir(s):
                shutil.copytree(s, d, True, None)
            else:
                shutil.copy2(s, d)

    os.chdir(temporary_path)

    with open('manifest.json', 'r+') as json_file:
        data = json.load(json_file)

        version = data['version']

        if (browser == 'beta'):
            data['name'] = 'ImprovedTube (testing)'

        if browser in ('edge', 'whale'):
            data['name'] = _sanitize_name_for_store(data.get('name', ''), browser)

        json_file.seek(0)
        json.dump(data, json_file, indent=4, sort_keys=True)
        json_file.truncate()

    archive_name = os.path.join('..', f'chromium-{browser}-{version}.zip')
    archive = zipfile.ZipFile(archive_name, 'w', zipfile.ZIP_DEFLATED)

    for root, dirs, files in os.walk('.'):
        for file in files:
            archive.write(os.path.join(root, file),
                          os.path.relpath(os.path.join(root, file),
                          				  os.path.join('.', '.')))

    archive.close()
    shutil.rmtree(temporary_path)


#---------------------------------------------------------------
# 3.0 FIREFOX
#---------------------------------------------------------------

def firefox():
    temporary_path = './cached'

    if os.path.isdir(temporary_path):
        shutil.rmtree(temporary_path, ignore_errors=True)

    os.mkdir(temporary_path)

    for item in os.listdir('.'):
        if (
            item != '.git' and
            item != '.github' and
            item != 'cached' and
            item != 'previews' and
            item != 'py' and
            item != 'wiki' and
            item != 'LICENSE' and
            item != 'README.md' and
            item != 'SECURITY.md' and
            item.find('.zip') == -1
        ):
            if item in EXCLUDE_TOP_LEVEL:
                continue
            s = os.path.join('.', item)
            d = os.path.join(temporary_path, item)
            if os.path.isdir(s):
                shutil.copytree(s, d, True, None)
            else:
                shutil.copy2(s, d)

    os.chdir(temporary_path)

    with open('manifest.json', 'r+', encoding='utf8') as json_file:
        data = json.load(json_file)

        version = data['version']

        data.pop('content_security_policy', None)
        data.pop('update_url', None)

        # Patch background for Firefox
        if 'background' in data:
            if 'service_worker' in data['background']:
                del data['background']['service_worker']
            data['background']['scripts'] = ['background.js']

        json_file.seek(0)
        json.dump(data, json_file, indent=4, sort_keys=True)
        json_file.truncate()

    archive = zipfile.ZipFile('../firefox-' + version + '.zip', 'w', zipfile.ZIP_DEFLATED)

    for root, dirs, files in os.walk('.'):
        for file in files:
            archive.write(os.path.join(root, file),
                          os.path.relpath(os.path.join(root, file),
                                          os.path.join('.', '.')))

    archive.close()
    os.chdir('..')
    shutil.rmtree(temporary_path)


#---------------------------------------------------------------
# 4.0 INITIALIZATION
#---------------------------------------------------------------

for arg in sys.argv:
    if arg == '-chromium-stable':
        chromium('stable')
    elif arg == '-chromium-beta':
        chromium('beta')
    elif arg == '-chromium-edge':
        chromium('edge')
    elif arg == '-chromium-whale':
        chromium('whale')
    elif arg == '-firefox':
        firefox()
