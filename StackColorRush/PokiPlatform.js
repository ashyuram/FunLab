class Platform extends BasePlatform {
    init() {
        return new Promise((resolve) => {
            try {
                if (this.isLocalHost) {
                    this.setupRobustMockSDKs(true);
                    resolve();
                    return;
                }

                if (typeof PokiSDK.init === 'function') {
                    PokiSDK.init()
                        .then(() => resolve())
                        .catch((err) => {
                            console.warn("PokiSDK.init promise rejected:", err);
                            this.setupRobustMockSDKs(true);
                            resolve();
                        });
                } else {
                    this.setupRobustMockSDKs(true);
                    resolve();
                }
            } catch (e) {
                console.warn("PokiSDK initialization error:", e);
                this.setupRobustMockSDKs(true);
                resolve();
            }
        });
    }

    gameplayStart() {
        try { PokiSDK.gameplayStart(); } catch (e) { }
    }

    gameplayStop() {
        try { PokiSDK.gameplayStop(); } catch (e) { }
    }

    showInterstitial() {
        return new Promise((resolve) => {
            PokiSDK.commercialBreak()
                .then(() => {
                    console.log("[PokiSDK] Commercial break finished");
                    resolve();
                })
                .catch(err => {
                    console.warn("[PokiSDK] Commercial break error:", err);
                    resolve();
                });
        });
    }

    showRewarded(type) {
        adRewardType = type;
        if (this.isLocalHost) {
            claimAdReward();
            return Promise.resolve();
        }
        showToast("Loading ad...");
        return PokiSDK.rewardedBreak()
            .then((withReward) => {
                if (withReward) {
                    claimAdReward();
                } else {
                    showToast("Ad break closed without reward.");
                }
            })
            .catch(err => {
                console.warn("[PokiSDK] Rewarded break error:", err);
                showToast("Ad playback failed.");
            });
    }

    exitGame() {
        showToast("Thanks for playing!");
    }
}

window.Platform = Platform;
