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
import pathlib
import re
import zipfile


#---------------------------------------------------------------
# 2.0 CHROMIUM
#---------------------------------------------------------------

def chromium(browser):
	temporary_path = '../tmp'

	if (os.path.isdir(temporary_path)):
		shutil.rmtree(temporary_path, ignore_errors=True)

	os.mkdir(temporary_path)
	os.chdir(temporary_path)

	for item in os.listdir('../src'):
		s = os.path.join('../src/', item)
		d = os.path.join(temporary_path, item)
		if os.path.isdir(s):
			shutil.copytree(s, d, True, None)
		else:
			shutil.copy2(s, d)

	with open('manifest.json', 'r+') as json_file:
		data = json.load(json_file)

		version = data['version']

		if (browser == 'beta'):
			data['name'] = 'ImprovedTube (testing)';

		json_file.seek(0)
		json.dump(data, json_file, indent=4, sort_keys=True)
		json_file.truncate()

	archive = zipfile.ZipFile('../chromium-' + version + '.zip', 'w', zipfile.ZIP_DEFLATED)

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
	temporary_path = '../tmp'

	if (os.path.isdir(temporary_path)):
		shutil.rmtree(temporary_path, ignore_errors=True)

	os.mkdir(temporary_path)
	os.chdir(temporary_path)

	for item in os.listdir('../src'):
		s = os.path.join('../src/', item)
		d = os.path.join(temporary_path, item)
		if os.path.isdir(s):
			shutil.copytree(s, d, True, None)
		else:
			shutil.copy2(s, d)

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

	archive = zipfile.ZipFile('../firefox-' + version + '.zip', 'w', zipfile.ZIP_DEFLATED)

	for root, dirs, files in os.walk('.'):
		for file in files:
			archive.write(os.path.join(root, file),
						  os.path.relpath(os.path.join(root, file),
						  				  os.path.join('.', '.')))

	archive.close()
	shutil.rmtree(temporary_path)


#---------------------------------------------------------------
# 4.0 INITIALIZATION
#---------------------------------------------------------------

for arg in sys.argv:
    if arg == '-chromium-stable':
        chromium('stable')
    elif arg == '-chromium-beta':
        chromium('beta')
    elif arg == '-firefox':
        firefox()