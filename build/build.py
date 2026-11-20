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

import json
import os
import zipfile
import re
import argparse
import tempfile
import time
from pathlib import Path

#---------------------------------------------------------------
# Helpers
#---------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent.parent
PACKAGE_FILES = ('manifest.json', 'background.js', 'LICENSE')
PACKAGE_DIRECTORIES = ('_locales', 'js&css', 'menu')

def _sanitize_name_for_store(name, store):
	# remove non-ASCII (simple emoji removal) and replace single quote with '*' for Edge/Whale
	sanitized = re.sub(r'[^\x00-\x7F]+', '', name or '')
	if store in ('edge', 'whale'):
		sanitized = sanitized.replace("'", "*")
	if store == 'whale':
		sanitized = sanitized.replace('&', '+')
	return sanitized

def _short_app_store_locale_text(text, max_bytes=112):
	text = re.sub(r'\s+', ' ', text or '').strip()

	if len(text.encode('utf8')) <= max_bytes:
		return text

	words = text.split(' ')
	shortened = ''

	for word in words:
		next_text = word if not shortened else shortened + ' ' + word

		if len(next_text.encode('utf8')) > max_bytes:
			break

		shortened = next_text

	if shortened:
		return shortened

	shortened = ''

	for char in text:
		if len((shortened + char).encode('utf8')) > max_bytes:
			break

		shortened += char

	return shortened

#---------------------------------------------------------------
# 2.0 CHROMIUM
#---------------------------------------------------------------

def package_sources():
	for name in PACKAGE_FILES:
		yield REPO_ROOT / name
	for name in PACKAGE_DIRECTORIES:
		if not (REPO_ROOT / name).is_dir() or (REPO_ROOT / name).is_symlink():
			raise ValueError('Missing or linked package directory: ' + name)
		for root, directories, files in os.walk(REPO_ROOT / name):
			directories[:] = sorted(d for d in directories if not d.startswith('.') and d != '__pycache__')
			for directory in directories:
				if (Path(root) / directory).is_symlink():
					raise ValueError('Linked package directory: ' + str(Path(root) / directory))
			for file in sorted(files):
				if file.startswith('.') or file in ('AGENTS.md', 'CLAUDE.md'):
					continue
				yield Path(root) / file


def manifest_for(browser):
	data = json.loads((REPO_ROOT / 'manifest.json').read_text(encoding='utf8'))
	if browser.startswith('chromium-'):
		store = browser.removeprefix('chromium-')
		data.get('background', {}).pop('scripts', None)
		data.pop('browser_specific_settings', None)
		data.get('action', {}).pop('default_area', None)
		if store == 'beta':
			data['name'] = 'ImprovedTube (testing)'
		elif store in ('edge', 'whale'):
			data['name'] = _sanitize_name_for_store(data.get('name', ''), store)
	elif browser == 'firefox':
		data.pop('content_security_policy', None)
		data.pop('update_url', None)
		data['background'] = {'scripts': ['background.js']}
	elif browser == 'safari':
		data['name'] = 'Improve YouTube! for YouTube & Videos'
		permissions = data.setdefault('permissions', [])
		if 'scripting' not in permissions:
			permissions.append('scripting')
	return data


def safari_locale(content):
	data = json.loads(content)
	for key, value in data.items():
		if not isinstance(value, dict):
			continue
		message = _short_app_store_locale_text(value.get('message'))
		if key == 'description_ext':
			value['message'] = message
		value['description'] = _short_app_store_locale_text(value.get('description') or message or key)
		if value.get('placeholders') == {}:
			del value['placeholders']
	return json.dumps(data, indent=4, sort_keys=True, ensure_ascii=False).encode('utf8')


def build(browser, output_dir):
	manifest = manifest_for(browser)
	version = manifest['version']
	if not re.fullmatch(r'\d+(?:\.\d+){0,3}', version):
		raise ValueError('Invalid extension version: ' + str(version))
	output_dir = Path(output_dir).resolve()
	output_dir.mkdir(parents=True, exist_ok=True)
	archive_path = output_dir / (browser + '-' + version + '.zip')
	# Stage beside the destination so a failed or concurrent build never leaves a partial archive.
	with tempfile.TemporaryDirectory(prefix='.improvedtube-build-', dir=output_dir) as stage:
		temporary_archive = Path(stage) / archive_path.name
		with zipfile.ZipFile(temporary_archive, 'w', zipfile.ZIP_DEFLATED) as archive:
			for source in package_sources():
				relative = source.relative_to(REPO_ROOT).as_posix()
				if source.is_symlink() or not source.resolve().is_relative_to(REPO_ROOT):
					raise ValueError('Package source must be inside the repository: ' + relative)
				if relative == 'manifest.json':
					content = json.dumps(manifest, indent=4, sort_keys=True, ensure_ascii=False).encode('utf8')
				elif browser == 'safari' and relative.startswith('_locales/') and source.name == 'messages.json':
					content = safari_locale(source.read_text(encoding='utf8'))
				else:
					content = source.read_bytes()
				info = zipfile.ZipInfo(relative, (1980, 1, 1, 0, 0, 0))
				info.compress_type = zipfile.ZIP_DEFLATED
				info.external_attr = 0o644 << 16
				archive.writestr(info, content)
		for attempt in range(5):
			try:
				os.replace(temporary_archive, archive_path)
				break
			except PermissionError:
				if os.name != 'nt' or attempt == 4:
					raise
				# Windows briefly locks a destination replaced by another build or scanned by antivirus.
				time.sleep(0.025 * (2 ** attempt))
	return archive_path


def main(argv=None):
	parser = argparse.ArgumentParser(description='Build browser-specific ImprovedTube archives without modifying the checkout.')
	for browser in ('chromium-stable', 'chromium-beta', 'chromium-edge', 'chromium-whale', 'firefox', 'safari'):
		parser.add_argument('-' + browser, action='append_const', dest='browsers', const=browser)
	parser.add_argument('--output-dir', type=Path, default=REPO_ROOT)
	args = parser.parse_args(argv)
	if not args.browsers:
		parser.error('Select at least one browser, for example -chromium-edge')
	for browser in dict.fromkeys(args.browsers):
		print(build(browser, args.output_dir))


if __name__ == '__main__':
	main()
