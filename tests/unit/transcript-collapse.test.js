// Test for transcript collapse/expand button functionality

const fs = require('fs');
const path = require('path');

describe('Transcript Collapse Button Feature', () => {
	describe('appearance.js - transcriptCollapseButton', () => {
		let appearanceContent;

		beforeAll(() => {
			const filePath = path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/appearance.js');
			appearanceContent = fs.readFileSync(filePath, 'utf8');
		});

		test('should create button with correct ID', () => {
			expect(appearanceContent).toContain("button.id = 'it-transcript-collapse-btn'");
		});

		test('should have accessibility attributes', () => {
			expect(appearanceContent).toContain("button.setAttribute('aria-label'");
			expect(appearanceContent).toContain("button.setAttribute('title'");
		});

		test('should toggle collapsed attribute on button click', () => {
			expect(appearanceContent).toContain("document.documentElement.setAttribute('it-transcript-collapsed', 'true')");
			expect(appearanceContent).toContain("document.documentElement.removeAttribute('it-transcript-collapsed')");
		});

		test('should update aria-label based on collapsed state', () => {
			expect(appearanceContent).toContain("'Collapse transcript panel'");
			expect(appearanceContent).toContain("'Expand transcript panel'");
		});

		test('should check if feature is enabled before creating button', () => {
			expect(appearanceContent).toContain("if (ImprovedTube.storage.transcript_collapse !== true) return;");
		});
	});

	describe('appearance.js - cleanupTranscriptCollapse', () => {
		let appearanceContent;

		beforeAll(() => {
			const filePath = path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/appearance.js');
			appearanceContent = fs.readFileSync(filePath, 'utf8');
		});

		test('should have cleanup function defined', () => {
			expect(appearanceContent).toContain("ImprovedTube.cleanupTranscriptCollapse = function");
		});

		test('should remove button from DOM', () => {
			expect(appearanceContent).toContain("document.querySelector('#it-transcript-collapse-btn')");
			expect(appearanceContent).toContain(".remove()");
		});

		test('should clear collapsed attribute', () => {
			expect(appearanceContent).toContain("document.documentElement.removeAttribute('it-transcript-collapsed')");
		});
	});

	describe('appearance.js - storage event listener', () => {
		let appearanceContent;

		beforeAll(() => {
			const filePath = path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/appearance.js');
			appearanceContent = fs.readFileSync(filePath, 'utf8');
		});

		test('should listen to storage update events', () => {
			expect(appearanceContent).toContain("document.addEventListener('it-storage-update'");
		});

		test('should monitor transcript_collapse setting changes', () => {
			expect(appearanceContent).toContain("e.detail.key === 'transcript_collapse'");
		});

		test('should call cleanup when setting is disabled', () => {
			expect(appearanceContent).toContain("if (e.detail.value === false)");
			expect(appearanceContent).toContain("ImprovedTube.cleanupTranscriptCollapse()");
		});
	});

	describe('sidebar.css - button styling', () => {
		let sidebarContent;

		beforeAll(() => {
			const filePath = path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/sidebar/sidebar.css');
			sidebarContent = fs.readFileSync(filePath, 'utf8');
		});

		test('should have button styling in CSS', () => {
			expect(sidebarContent).toContain("#it-transcript-collapse-btn");
		});

		test('should position button absolutely', () => {
			expect(sidebarContent).toContain("position: absolute");
		});

		test('should style collapsed state properly', () => {
			expect(sidebarContent).toContain("it-transcript-collapsed");
			expect(sidebarContent).toContain("max-width: 60px");
		});
	});

	describe('menu settings configuration', () => {
		let menuContent;

		beforeAll(() => {
			const filePath = path.join(__dirname, '../../menu/skeleton-parts/appearance.js');
			menuContent = fs.readFileSync(filePath, 'utf8');
		});

		test('should have transcript_collapse toggle in menu', () => {
			expect(menuContent).toContain("transcript_collapse:");
			expect(menuContent).toContain("component: 'switch'");
		});

		test('should have correct label reference', () => {
			expect(menuContent).toContain("text: 'Collapse_transcript_panel'");
		});

		test('should set default value to true', () => {
			expect(menuContent).toContain("value: true");
		});
	});

	describe('translations', () => {
		let messagesContent;

		beforeAll(() => {
			const filePath = path.join(__dirname, '../../_locales/en/messages.json');
			messagesContent = fs.readFileSync(filePath, 'utf8');
		});

		test('should have message for Collapse_transcript_panel', () => {
			expect(messagesContent).toContain("Collapse_transcript_panel");
		});

		test('should have descriptive message', () => {
			expect(messagesContent).toContain("collapse");
			expect(messagesContent).toContain("expand");
		});
	});
});
