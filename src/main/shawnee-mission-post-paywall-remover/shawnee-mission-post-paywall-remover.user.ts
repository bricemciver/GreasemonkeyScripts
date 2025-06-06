namespace ShawneeMissionPostPaywallRemover {
	// Select the node that should be monitored
	const targetNode = document.documentElement;

	// Options for the observer (which mutations to observe)
	const config = { childList: true, subtree: true, attributes: true };

	// Callback function to execute when mutations are observed
	const callback: MutationCallback = (mutationsList) => {
		for (const mutation of mutationsList) {
			if (mutation.type === "childList") {
				hidePaywallElement(mutation);
			}
			if (mutation.type === "attributes") {
				unblurElement(mutation);
			}
		}
	};

	const unblurElement = (mutation: MutationRecord) => {
		if (mutation.target.nodeType === Node.ELEMENT_NODE) {
			const element = mutation.target as Element;
			if (element.classList.contains("wkwp-blur")) {
				element.classList.remove("wkwp-blur");
			}
		}
	};

	const hidePaywallElement = (mutation: MutationRecord) => {
		for (const node of Array.from(mutation.addedNodes)) {
			if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as Element;
				if (element.classList.contains("wkwp-paywall")) {
					element.setAttribute("style", "display: none");
				}
			}
		}
	};

	export const main = () => {
		// Create an observer instance linked to the callback function
		const observer = new MutationObserver(callback);

		// Start observing the target node for configured mutations
		observer.observe(targetNode, config);
	};
}
ShawneeMissionPostPaywallRemover.main();
