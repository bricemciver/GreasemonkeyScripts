namespace KansasCityStarAntiAnnoy {

    export const hidePaywall = () => {
        const observer = new MutationObserver((records) => {
            for (const record of records) {
                record.addedNodes.forEach((addedNode) => {
                    if (addedNode.nodeName === 'MCC-PAYWALL') {
                        if (addedNode.parentNode) {
                            addedNode.parentNode.removeChild(addedNode);
                        }
                    }
                })
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

    }
}
KansasCityStarAntiAnnoy.hidePaywall();
