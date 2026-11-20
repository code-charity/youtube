import concurrent.futures
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock
import zipfile
from html.parser import HTMLParser


ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('extension_build', ROOT / 'build' / 'build.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
BROWSERS = ('chromium-stable', 'chromium-beta', 'chromium-edge', 'chromium-whale', 'firefox', 'safari')


class BuildTests(unittest.TestCase):
	def setUp(self):
		self.temporary = tempfile.TemporaryDirectory(prefix='improvedtube-build-test-')
		self.addCleanup(self.temporary.cleanup)
		self.root = Path(self.temporary.name) / 'source'
		self.output = Path(self.temporary.name) / 'output'
		self.root.mkdir()
		self.manifest = {
			'manifest_version': 3, 'version': '4.1', 'name': "'Improve YouTube!' 🎧 & Videos",
			'background': {'service_worker': 'background.js', 'scripts': ['background.js']},
			'action': {'default_popup': 'menu/index.html', 'default_area': 'navbar'},
			'browser_specific_settings': {'gecko': {'id': 'test@example.org'}},
			'permissions': ['storage'], 'update_url': 'https://example.org/update',
		}
		(self.root / 'manifest.json').write_text(json.dumps(self.manifest, ensure_ascii=False), encoding='utf8')
		(self.root / 'background.js').write_text('/* worker */', encoding='utf8')
		(self.root / 'LICENSE').write_text('License must ship with the code. ©', encoding='utf8')
		(self.root / 'menu').mkdir()
		(self.root / 'menu' / 'index.html').write_text('<!doctype html><title>Menu</title>', encoding='utf8')
		(self.root / 'js&css').mkdir()
		(self.root / 'js&css' / 'player.js').write_text('/* player */', encoding='utf8')
		locale = self.root / '_locales' / 'en'
		locale.mkdir(parents=True)
		(locale / 'messages.json').write_text(json.dumps({
			'description_ext': {'message': '🎧 ' * 100, 'placeholders': {}},
			'longLabel': {'message': 'An ordinary label ' * 40},
		}), encoding='utf8')
		self.patch = mock.patch.object(builder, 'REPO_ROOT', self.root)
		self.patch.start()
		self.addCleanup(self.patch.stop)

	def test_all_browser_manifests_and_license(self):
		original = (self.root / 'manifest.json').read_bytes()
		for browser in BROWSERS:
			with self.subTest(browser=browser):
				archive = builder.build(browser, self.output)
				with zipfile.ZipFile(archive) as package:
					self.assertIsNone(package.testzip())
					self.assertEqual(package.read('LICENSE'), (self.root / 'LICENSE').read_bytes())
					manifest = json.loads(package.read('manifest.json'))
					self.assertEqual(manifest['version'], '4.1')
					if browser.startswith('chromium-'):
						self.assertEqual(manifest['background'], {'service_worker': 'background.js'})
						self.assertNotIn('browser_specific_settings', manifest)
						self.assertNotIn('default_area', manifest['action'])
					elif browser == 'firefox':
						self.assertEqual(manifest['background'], {'scripts': ['background.js']})
						self.assertIn('gecko', manifest['browser_specific_settings'])
						self.assertNotIn('update_url', manifest)
					else:
						self.assertEqual(manifest['permissions'].count('scripting'), 1)
					if browser in ('chromium-edge', 'chromium-whale'):
						self.assertTrue(manifest['name'].isascii())
						self.assertNotIn("'", manifest['name'])
					if browser == 'chromium-whale':
						self.assertNotIn('&', manifest['name'])
					if browser == 'chromium-beta':
						self.assertEqual(manifest['name'], 'ImprovedTube (testing)')
		self.assertEqual((self.root / 'manifest.json').read_bytes(), original)

	def test_only_runtime_assets_are_packaged(self):
		for name in ('AGENTS.md', 'CLAUDE.md', '.env', 'package.json', 'unexpected.txt'):
			(self.root / name).write_text('do not package', encoding='utf8')
		(self.root / 'menu' / 'AGENTS.md').write_text('local policy', encoding='utf8')
		(self.root / 'menu' / '.cache').mkdir()
		(self.root / 'menu' / '.cache' / 'state').write_text('local state', encoding='utf8')
		with zipfile.ZipFile(builder.build('chromium-edge', self.output)) as package:
			self.assertEqual(set(package.namelist()), {
				'manifest.json', 'background.js', 'LICENSE', 'menu/index.html',
				'js&css/player.js', '_locales/en/messages.json',
			})

	def test_safari_limits_metadata_bytes_but_preserves_normal_labels(self):
		with zipfile.ZipFile(builder.build('safari', self.output)) as package:
			messages = json.loads(package.read('_locales/en/messages.json'))
		self.assertLessEqual(len(messages['description_ext']['message'].encode('utf8')), 112)
		self.assertNotIn('placeholders', messages['description_ext'])
		self.assertEqual(messages['longLabel']['message'], 'An ordinary label ' * 40)
		for value in messages.values():
			self.assertLessEqual(len(value['description'].encode('utf8')), 112)

	def test_repeat_and_concurrent_builds_are_deterministic(self):
		archive = builder.build('chromium-edge', self.output)
		original = archive.read_bytes()
		with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
			outputs = list(executor.map(lambda _: builder.build('chromium-edge', self.output), range(2)))
		self.assertEqual(outputs, [archive, archive])
		self.assertEqual(archive.read_bytes(), original)
		self.assertEqual(list(self.output.iterdir()), [archive])

	def test_failure_preserves_existing_archive_and_cleans_staging(self):
		archive = builder.build('chromium-edge', self.output)
		original = archive.read_bytes()
		(self.root / 'background.js').unlink()
		with self.assertRaises(FileNotFoundError):
			builder.build('chromium-edge', self.output)
		self.assertEqual(archive.read_bytes(), original)
		self.assertEqual(list(self.output.iterdir()), [archive])

	def test_rejects_missing_runtime_directory(self):
		(self.root / 'js&css' / 'player.js').unlink()
		(self.root / 'js&css').rmdir()
		with self.assertRaisesRegex(ValueError, 'Missing or linked package directory'):
			builder.build('chromium-edge', self.output)

	def test_rejects_unsafe_version_before_creating_output(self):
		self.manifest['version'] = '../../outside'
		(self.root / 'manifest.json').write_text(json.dumps(self.manifest), encoding='utf8')
		with self.assertRaisesRegex(ValueError, 'Invalid extension version'):
			builder.build('chromium-edge', self.output)
		self.assertFalse(self.output.exists())

	def test_cli_builds_multiple_variants_from_another_working_directory(self):
		with tempfile.TemporaryDirectory(dir=self.temporary.name) as working:
			result = subprocess.run([
				sys.executable, str(ROOT / 'build' / 'build.py'), '-chromium-edge', '-firefox', '-chromium-edge',
				'--output-dir', str(self.output),
			], cwd=working, capture_output=True, text=True)
			self.assertEqual(result.returncode, 0, result.stderr)
			self.assertEqual(len(result.stdout.splitlines()), 2)
			self.assertEqual(list(Path(working).iterdir()), [])
			for archive in self.output.glob('*.zip'):
				with zipfile.ZipFile(archive) as package:
					self.assertIsNone(package.testzip())
					self.assertIn('LICENSE', package.namelist())
					self.assertNotIn('AGENTS.md', package.namelist())


class ResourceReferences(HTMLParser):
	def __init__(self):
		super().__init__()
		self.paths = []

	def handle_starttag(self, tag, attrs):
		attrs = dict(attrs)
		if tag == 'script' and attrs.get('src'):
			self.paths.append(attrs['src'])
		if tag == 'link' and attrs.get('rel') == 'stylesheet':
			self.paths.append(attrs['href'])


class RuntimeAssetTests(unittest.TestCase):
	def test_popup_scripts_and_styles_exist(self):
		parser = ResourceReferences()
		parser.feed((ROOT / 'menu' / 'index.html').read_text(encoding='utf8'))
		self.assertGreater(len(parser.paths), 0)
		for relative in parser.paths:
			with self.subTest(resource=relative):
				self.assertTrue((ROOT / 'menu' / relative).is_file(), relative)


if __name__ == '__main__':
	unittest.main()
