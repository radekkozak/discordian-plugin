import {App, Plugin, PluginSettingTab, Setting} from "obsidian";

export default class DiscordianPlugin extends Plugin {
    settings: DiscordianPluginSettings;

    onInit() {

    }

    async onload() {
        console.log("Plugin is Loading...");

        // This snippet of code is used to load pluging settings from disk (if any)
        // and then add the setting tab in the Obsidian Settings panel.
        // If your plugin does not use settings, you can delete these two lines.
        this.settings = (await this.loadData()) || {
            hideVault: false,
            hideMetadata: false,
            darkEnhance: false,
            writerMode: false,
            focusParagraphMode: false,
            flatAndyMode: true,
            readableLength: 45
        };

        this.addSettingTab(new DiscordianPluginSettingsTab(this.app, this));

        this.addStyle()

        this.addCommand({
            id: 'toggle-discordian-writer',
            name: 'Toggle writer mode',
            callback: () => {
                this.settings.writerMode = !this.settings.writerMode;
                this.saveData(this.settings);
                this.refresh();
            }
        });

        this.refresh()
    }

    onunload() {
        console.log("Plugin is Unloading...");
    }

    // add the styling elements we need
    addStyle() {
        // add a css block for our settings-dependent styles
        const css = document.createElement('style');
        css.id = 'discordian-theme';
        document.getElementsByTagName("head")[0].appendChild(css);

        // add the main class
        document.body.classList.add('discordian-theme');
        document.body.classList.add('discordian-flat-andy');
        document.body.classList.add('discordian-readable-length');

        // update the style with the settings-dependent styles
        this.updateStyle();
    }

    setReadableLineLength() {
        console.log("Setting Readable line length...")
        const el = document.getElementsByClassName('markdown-source-view is-readable-line-width')
        if (el) {
            const discordianEl = document.getElementById('discordian-theme')
            if (discordianEl) {
                const len = this.settings.readableLength + 'rem'
                discordianEl.innerText = `
                    body.discordian-theme {
                        --readable-line-length:${len};
                    }
                `;
                console.log("Setting readable length option to " + len)
            } else {
                throw "Could not find Discordian Theme";
            }
        } else {
            throw "Obsidian's Readable Line Length option is not enabled";
        }

    }

    // update the styles (at the start, or as the result of a settings change)
    updateStyle() {
        console.log("Updating style...")
        console.log("Settings before toggle = " + this.settings)
        document.body.classList.toggle('discordian-vault', this.settings.hideVault);
        document.body.classList.toggle('discordian-metadata', this.settings.hideMetadata);
        document.body.classList.toggle('discordian-dark-enhance', this.settings.darkEnhance);
        document.body.classList.toggle('discordian-writer', this.settings.writerMode);
        document.body.classList.toggle('discordian-focus-paragraph', this.settings.focusParagraphMode);
        document.body.classList.toggle('discordian-flat-andy', this.settings.flatAndyMode);

        this.setReadableLineLength()
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
    darkEnhance: boolean
    writerMode: boolean
    focusParagraphMode: boolean
    focusParagraphFade: number
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

        const description = containerEl.createEl('div', {cls:'plugin-description'});

        description.createEl('h3', {text: 'Thanks for using Discordian !'});
        description.createEl('p', {text: 'If you notice any issues, try to update to the latest version and reload Obsidian.'});
        description.createEl('p', {text: 'Otherwise feel free to bring it up on Github or better yet contribute a fix.'});
        description.createEl('a', {text: 'https://github.com/radekkozak/discordian/issues/', attr: {'href':'https://github.com/radekkozak/discordian/issues/','target':'_blank'}});
        containerEl.createEl('h4', {text: 'Theme Settings'});

        new Setting(containerEl)
            .setName('Writer mode')
            .setDesc('Hides visual excess (accessed by hover) when sidebars are collapsed')
            .addToggle(toggle => toggle.setValue(settings.writerMode)
                .onChange((value) => {
                    settings.writerMode = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                })
            );

        new Setting(containerEl)
            .setName('Paragraph focus mode')
            .setDesc('This aims to imitate well-known iaWriter paragraph focus.')
            .addToggle(toggle => toggle.setValue(settings.focusParagraphMode)
                .onChange((value) => {
                    settings.focusParagraphMode = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                })
            );

        new Setting(containerEl)
            .setName('Flat Andy\'s Mode')
            .setDesc('Flatter notes stacking when in Andy\'s mode (no elevation shadow)')
            .addToggle(toggle => toggle.setValue(settings.flatAndyMode)
                .onChange((value) => {
                    settings.flatAndyMode = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                })
            );

        const name = 'Readable line length '
        const readableSettings = new Setting(containerEl)
            .setName(name + '( = ' + this.plugin.settings.readableLength + ' )')
            .setDesc('Sets desired line length for Obsidian\'s Readable line length (default 45)')
            .addSlider(slider => slider.setLimits(45, 120, 1)
                .setValue(this.plugin.settings.readableLength)
                .onChange((value) => {
                    settings.readableLength = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();

                    readableSettings.setName(name + '( = ' + this.plugin.settings.readableLength + ' )')
                })
            );

        new Setting(containerEl)
            .setName('Hide vault')
            .setDesc('Hides the vault in File Explorer')
            .addToggle(toggle => toggle.setValue(settings.hideVault)
                .onChange((value) => {
                    settings.hideVault = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                })
            );

        new Setting(containerEl)
            .setName('Darker note headers')
            .setDesc('Makes note header more prominent')
            .addToggle(toggle => toggle.setValue(settings.darkEnhance)
                .onChange((value) => {
                    settings.darkEnhance = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                })
            );

        new Setting(containerEl)
            .setName('Hide new frontmatter in preview')
            .setDesc('Hides new metadata section in preview mode')
            .addToggle(toggle => toggle.setValue(settings.hideMetadata)
                .onChange((value) => {
                    settings.hideMetadata = value;
                    this.plugin.saveData(settings);
                    this.plugin.refresh();
                })
            );
    }
}
