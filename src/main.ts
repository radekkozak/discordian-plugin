import {App, Plugin, PluginSettingTab, Setting} from "obsidian";

export default class DiscordianPlugin extends Plugin {
    settings: DiscordianPluginSettings;

    async onload() {

        this.settings = await this.loadData() || {
            hideVault: true,
            hideTitleBar: true,
            hideStatusBar: true,
            darkEnhance: false,
            fontSizeNotes: 14,
            fontSizeFileExplorer: 14,
            writerMode: false,
            paragraphFocusMode: false,
            paragraphFocusFade: 75,
            flatAndyMode: true,
            readableLength: 45
        };

        this.addSettingTab(new DiscordianPluginSettingsTab(this.app, this));

        this.addStyle()

        this.addCommands()

        this.refresh()
    }

    onunload() {
        this.removeStyle()
    }

    addCommands() {

        this.addCommand({
            id: 'toggle-discordian-writer-mode',
            name: 'Toggle Writer Mode',
            callback: () => {
                this.settings.writerMode = !this.settings.writerMode;
                this.saveData(this.settings);
                this.refresh();
            }
        });

        this.addCommand({
            id: 'toggle-flat-andy-mode',
            name: 'Toggle Flat Andy Mode',
            callback: () => {
                this.settings.flatAndyMode = !this.settings.flatAndyMode;
                this.saveData(this.settings);
                this.refresh();
            }
        });

        this.addCommand({
            id: 'toggle-paragraph-focus-mode',
            name: 'Toggle Paragraph Focus Mode',
            callback: () => {
                this.settings.paragraphFocusMode = !this.settings.paragraphFocusMode;
                this.saveData(this.settings);
                this.refresh();
            }
        });

        this.addCommand({
            id: 'toggle-dark-enhance',
            name: 'Toggle Dark note headers',
            callback: () => {
                this.settings.darkEnhance = !this.settings.darkEnhance;
                this.saveData(this.settings);
                this.refresh();
            }
        });
    }

    // add the styling elements we need
    addStyle() {
        // add a css block for our settings-dependent styles
        const css = document.createElement('style');
        css.id = 'discordian-theme';
        document.getElementsByTagName("head")[0].appendChild(css);

        // add the main class
        document.body.classList.add('discordian-theme');
        document.body.classList.add('discordian-readable-length');
        document.body.classList.add('discordian-paragraph-focus-fade');

        // update the style with the settings-dependent styles
        this.updateStyle();
    }

    removeStyle() {
        const discordianClasses = [
            'discordian-theme',
            'discordian-writer-mode',
            'discordian-flat-andy-mode',
            'discordian-paragraph-focus',
            'discordian-paragraph-focus-fade',
            'discordian-readable-length',
            'discordian-font-size-notes',
            'discordian-font-size-file-explorer',
            'discordian-dark-enhance',
            'discordian-hide-vault',
            'discordian-hide-titlebar',
            'discordian-hide-statusbar'
        ]
        document.body.removeClasses(discordianClasses);
    }

    initStyles() {
        const discordianEl = document.getElementById('discordian-theme')
        if (discordianEl) {
            const len = this.settings.readableLength + 'rem'
            const fade = 100 - this.settings.paragraphFocusFade
            const fontSizeNotes = this.settings.fontSizeNotes / 16 + 'rem'
            const fontSizeFileExplorer = this.settings.fontSizeFileExplorer / 16 + 'rem'
            const letterSpacingNotes = (this.settings.fontSizeNotes < 16 ? -0.2 : -0.4) + 'px'

            discordianEl.innerText = `
                    body.discordian-theme {
                        --readable-line-length:${len};
                        --paragraph-focus-fade: 0.${fade};
                        --font-size-notes: ${fontSizeNotes};
                        --font-size-file-explorer: ${fontSizeFileExplorer};
                        --letter-spacing-notes: ${letterSpacingNotes};
                    }
                `;
        } else {
            throw "Could not find Discordian Theme";
        }
    }

    // update the styles (at the start, or as the result of a settings change)
    updateStyle() {
        document.body.classList.toggle('discordian-writer-mode', this.settings.writerMode);
        document.body.classList.toggle('discordian-flat-andy-mode', this.settings.flatAndyMode);
        document.body.classList.toggle('discordian-paragraph-focus', this.settings.paragraphFocusMode);
        document.body.classList.toggle('discordian-hide-vault', this.settings.hideVault);
        document.body.classList.toggle('discordian-hide-titlebar', this.settings.hideTitleBar);
        document.body.classList.toggle('discordian-hide-statusbar', this.settings.hideStatusBar);
        document.body.classList.toggle('discordian-dark-enhance', this.settings.darkEnhance);

        this.initStyles()
    }

// refresh function for when we change settings
    refresh = () => {
        // re-load the style
        this.updateStyle()
    }
}

interface DiscordianPluginSettings {
    hideVault: boolean
    hideMetadata: boolean
    hideTitleBar: boolean
    hideStatusBar: boolean
    darkEnhance: boolean
    fontSizeNotes: number
    fontSizeFileExplorer: number
    letterSpacingNotes: number
    writerMode: boolean
    paragraphFocusMode: boolean
    paragraphFocusFade: number
    flatAndyMode: boolean
    readableLength: number
}

class DiscordianPluginSettingsTab extends PluginSettingTab {
    plugin: DiscordianPlugin;

    constructor(app: App, plugin: DiscordianPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
        const settings = this.plugin.settings;

        containerEl.empty();

        this.addPluginDescription(containerEl)

        this.addPluginSettingsHeader(containerEl, 'Theme Settings')
        this.addWriterModeSettings(containerEl, settings)
        this.addFlatAndyModeSettings(containerEl, settings)
        this.addParagraphFocusModeSettings(containerEl, settings)
        this.addReadableLengthSettings(containerEl, settings)
        this.addDarkEnhanceSettings(containerEl, settings)

        this.addPluginSettingsSeparator(containerEl)

        this.addPluginSettingsHeader(containerEl, 'Fonts')
        this.addNotesFontSizeSettings(containerEl, settings)
        this.addFileExplorerFontSizeSettings(containerEl, settings)

        this.addPluginSettingsSeparator(containerEl)

        this.addPluginSettingsHeader(containerEl, 'If not using Hider plugin')
        this.addHideVaultSettings(containerEl, settings)
        this.addHideTitleBarSettings(containerEl, settings)
        this.addHideStatusBarSettings(containerEl, settings)
    }

    addPluginDescription(containerEl: HTMLElement) {
        const description = containerEl.createEl('div', {cls: 'plugin-description'});

        description.createEl('h3', {text: 'Thanks for using Discordian !'});
        description.createEl('p', {text: 'If you notice any issues, try to update to the latest version and reload Obsidian.'});
        description.createEl('p', {text: 'Otherwise feel free to bring it up on Github or better yet contribute a fix.'});
        description.createEl('a', {
            text: 'https://github.com/radekkozak/discordian/issues/',
            attr: {'href': 'https://github.com/radekkozak/discordian/issues/', 'target': '_blank'}
        });
    }

    addPluginSettingsHeader(containerEl: HTMLElement, headerTitle: string) {
        containerEl.createEl('h4', {text: headerTitle});
    }

    addPluginSettingsSeparator(containerEl: HTMLElement) {
        containerEl.createEl('p', {text: '⊷', cls: 'plugin-description separator'});
    }

    addReadableLengthSettings(containerEl: HTMLElement, settings: DiscordianPluginSettings) {
        const name = 'Readable line length '
        const setting = new Setting(containerEl)
            .setName(name + '( = ' + settings.readableLength + 'rem )')
            .setDesc('Obsidian\'s Readable line length needs to be enabled (default 45 rem)')
            .addSlider(slider => slider.setLimits(45, 120, 5)
                .setValue(settings.readableLength)
                .onChange((value) => {
                    settings.readableLength = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                    setting.setName(name + '( = ' + settings.readableLength + 'rem )')
                })
            );
    }

    addWriterModeSettings(containerEl: HTMLElement, settings: DiscordianPluginSettings) {
        new Setting(containerEl)
            .setName('Writer mode')
            .setDesc('Hides visual excess when sidebars are collapsed (accessible by hover) ')
            .addToggle(toggle => toggle.setValue(settings.writerMode)
                .onChange((value) => {
                    settings.writerMode = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                })
            );
    }

    addParagraphFocusModeSettings(containerEl: HTMLElement, settings: DiscordianPluginSettings) {
        new Setting(containerEl)
            .setName('Paragraph focus mode')
            .setDesc('This aims to imitate well-known iA Writer paragraph focus.')
            .addToggle(toggle => toggle.setValue(settings.paragraphFocusMode)
                .onChange((value) => {
                    settings.paragraphFocusMode = value;
                    this.plugin.saveData(settings);
                    focusFadeSettings.settingEl.classList.toggle('discordian-plugin-setting-disabled', !value)
                    this.plugin.refresh();
                })
            );

        const nameFade = 'Paragraph Focus Mode fade '
        const focusFadeSettings = new Setting(containerEl)
            .setName(nameFade + '( = ' + settings.paragraphFocusFade + '% )')
            .setDesc('Amount of fade out when in Paragraph Focus Mode (default 75%)')
            .addSlider(slider => slider.setLimits(25, 90, 5)
                .setValue(settings.paragraphFocusFade)
                .onChange((value) => {
                    settings.paragraphFocusFade = value;
                    focusFadeSettings.settingEl.classList.toggle('discordian-plugin-setting-disabled', !value);
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                    focusFadeSettings.setName(nameFade + '( = ' + settings.paragraphFocusFade + '% )')
                })
            );

        focusFadeSettings.settingEl.classList.toggle('discordian-plugin-setting-disabled', !settings.paragraphFocusMode);
    }

    addFlatAndyModeSettings(containerEl: HTMLElement, settings: DiscordianPluginSettings) {
        new Setting(containerEl)
            .setName('Flat Andy Mode')
            .setDesc('Flatter notes stacking when in Andy Mode (no elevation shadow)')
            .addToggle(toggle => toggle.setValue(settings.flatAndyMode)
                .onChange((value) => {
                    settings.flatAndyMode = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                })
            );
    }

    addDarkEnhanceSettings(containerEl: HTMLElement, settings: DiscordianPluginSettings) {
        new Setting(containerEl)
            .setName('Dark note headers')
            .setDesc('Makes note header more prominent')
            .addToggle(toggle => toggle.setValue(settings.darkEnhance)
                .onChange((value) => {
                    settings.darkEnhance = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                })
            );
    }

    addNotesFontSizeSettings(containerEl: HTMLElement, settings: DiscordianPluginSettings) {
        const name = 'Notes font size '
        const setting = new Setting(containerEl)
            .setName(name + '( = ' + settings.fontSizeNotes + 'px )')
            .setDesc('Used in editor/preview mode (default 14px)')
            .addSlider(slider => slider.setLimits(14, 22, 2)
                .setValue(settings.fontSizeNotes)
                .onChange((value) => {
                    settings.fontSizeNotes = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                    setting.setName(name + '( = ' + value + 'px )')
                })
            );
    }

    addFileExplorerFontSizeSettings(containerEl: HTMLElement, settings: DiscordianPluginSettings) {
        const name = 'File Explorer font size '
        const setting = new Setting(containerEl)
            .setName(name + '( = ' + settings.fontSizeFileExplorer + 'px )')
            .setDesc('Used in File Explorer (default 14px)')
            .addSlider(slider => slider.setLimits(12, 18, 2)
                .setValue(settings.fontSizeFileExplorer)
                .onChange((value) => {
                    settings.fontSizeFileExplorer = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                    setting.setName(name + '( = ' + value + 'px )')
                })
            );
    }

    addHideVaultSettings(containerEl: HTMLElement, settings: DiscordianPluginSettings) {
        new Setting(containerEl)
            .setName('Hide vault name')
            .setDesc('Hides vault name in File Explorer')
            .addToggle(toggle => toggle.setValue(settings.hideVault)
                .onChange((value) => {
                    settings.hideVault = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                })
            );
    }

    addHideTitleBarSettings(containerEl: HTMLElement, settings: DiscordianPluginSettings) {
        new Setting(containerEl)
            .setName('Hide title bar')
            .setDesc('Hides main title bar (theme\'s default)')
            .addToggle(toggle => toggle.setValue(settings.hideTitleBar)
                .onChange((value) => {
                    settings.hideTitleBar = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                })
            );
    }

    addHideStatusBarSettings(containerEl: HTMLElement, settings: DiscordianPluginSettings) {
        new Setting(containerEl)
            .setName('Hide status bar')
            .setDesc('Hides status bar (theme\'s default)')
            .addToggle(toggle => toggle.setValue(settings.hideStatusBar)
                .onChange((value) => {
                    settings.hideStatusBar = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                })
            );
    }
}
