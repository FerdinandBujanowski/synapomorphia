import { ItemView, WorkspaceLeaf } from "obsidian";

export const TREE_QUIZ_VIEW = "tree-quiz-view";

export class TreeQuizView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return TREE_QUIZ_VIEW;
	}

	getDisplayText() {
		return "Tree Quiz View";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", { text: "Tree Quiz View!" });
	}

	async onClose() {
		// Nothing to clean up.
	}
}
