import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFolder,
	WorkspaceLeaf,
} from "obsidian";

import { TreeQuizView, TREE_QUIZ_VIEW } from "views/TreeQuizView";

// Remember to rename these classes and interfaces!

interface SynaSettings {
	phylo_prop: string;
	phylo_header: number;
	syna_prop: string;
	syna_header: number;
	child_folder: string;
}

const DEFAULT_SETTINGS: SynaSettings = {
	phylo_prop: "Arbre Phylogénétique",
	phylo_header: 3,
	syna_prop: "Synapomorphies",
	syna_header: 3,
	child_folder: "fils",
};

export default class SynapomorphiaPlugin extends Plugin {
	settings: SynaSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(TREE_QUIZ_VIEW, (leaf) => new TreeQuizView(leaf));

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon("bug", "Synapomorphia", () => {
			// Called when the user clicks the icon.
			this.activateTreeQuizView();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				console.log();
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (file instanceof TFolder) {
					menu.addItem((item) => {
						item.setIcon("bug");
						item.setTitle("Generate Phylogenetic Tree");
						item.onClick(() => {
							new Notice(file.name);
						});
					});
				}
			})
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async test() {}

	async activateTreeQuizView() {
		new Notice("Test");
		const { workspace } = this.app;
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(TREE_QUIZ_VIEW);

		if (leaves.length > 0) {
			leaf = leaves[0];
			workspace.revealLeaf(leaf);
		} else {
			const activeLeaf = workspace.activeLeaf;
			if (activeLeaf) {
				leaf = workspace.createLeafBySplit(activeLeaf, "vertical");
				await leaf.setViewState({ type: TREE_QUIZ_VIEW, active: true });
				if (leaf != null) workspace.revealLeaf(leaf);
			}
		}

		// workspace.revealLeaf();
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: SynapomorphiaPlugin;

	constructor(app: App, plugin: SynapomorphiaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Synapomorphia Settings" });

		new Setting(containerEl)
			.setName("Phylogenetic Tree Prop")
			.setDesc("header under which to find a group's phylogenetic tree")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.phylo_prop)
					.onChange(async (value) => {
						this.plugin.settings.phylo_prop = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Phylogenetic Tree Header Size")
			.setDesc("header size for phylogenetic tree prop")
			.addDropdown((dropDown) =>
				dropDown
					.addOption("1", "H1 (#)")
					.addOption("2", "H2 (##)")
					.addOption("3", "H3 (###)")
					.addOption("4", "H4 (####)")
					.addOption("5", "H5 (#####)")
					.addOption("6", "H6 (######)")
					.setValue(this.plugin.settings.phylo_header.toString())
					.onChange(async (value) => {
						this.plugin.settings.phylo_header = Number(value);
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Synapomorphy Prop")
			.setDesc("header under which to find a group's synapomorphies")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.syna_prop)
					.onChange(async (value) => {
						this.plugin.settings.syna_prop = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Synapomorphy Header Size")
			.setDesc("header size for synapomorphy prop")
			.addDropdown((dropDown) =>
				dropDown
					.addOption("1", "H1 (#)")
					.addOption("2", "H2 (##)")
					.addOption("3", "H3 (###)")
					.addOption("4", "H4 (####)")
					.addOption("5", "H5 (#####)")
					.addOption("6", "H6 (######)")
					.setValue(this.plugin.settings.syna_header.toString())
					.onChange(async (value) => {
						this.plugin.settings.syna_header = Number(value);
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Children Folder Name")
			.setDesc("children folder name inside group folder")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.child_folder)
					.onChange(async (value) => {
						this.plugin.settings.child_folder = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
