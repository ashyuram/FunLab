class Platform extends BasePlatform {
    init() {
        return new Promise((resolve) => {
            try {
                if (this.isLocalHost) {
                    this.setupRobustMockSDKs(true);
                    resolve();
                    return;
                }

                if (window.CrazyGames && window.CrazyGames.SDK) {
                    window.CrazyGames.SDK.init()
                        .then(() => {
                            try { window.CrazyGames.SDK.game.loadingStart(); } catch (e) { }
                            resolve();
                        })
                        .catch((err) => {
                            console.warn("CrazyGames SDK.init promise rejected:", err);
                            this.setupRobustMockSDKs(true);
                            resolve();
                        });
                } else {
                    this.setupRobustMockSDKs(true);
                    resolve();
                }
            } catch (e) {
                console.warn("CrazyGames SDK initialization error:", e);
                this.setupRobustMockSDKs(true);
                resolve();
            }
        });
    }

    gameplayStart() {
        try {
            window.CrazyGames.SDK.game.loadingStop();
            window.CrazyGames.SDK.game.gameplayStart();
        } catch (e) { }
    }

    gameplayStop() {
        try { window.CrazyGames.SDK.game.gameplayStop(); } catch (e) { }
    }

    happyTime() {
        try { window.CrazyGames.SDK.game.happytime(); } catch (e) { }
    }

    showInterstitial() {
        if (this.isLocalHost) {
            console.log("[Mock Ad] Triggering mock CrazyGames Interstitial Ad");
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            window.CrazyGames.SDK.ad.requestAd("midgame", {
                adStarted: () => {
                    console.log("CrazyGames midgame ad started");
                },
                adFinished: () => {
                    console.log("CrazyGames midgame ad finished");
                    resolve();
                },
                adError: (error) => {
                    console.warn("CrazyGames midgame ad error:", error);
                    resolve();
                }
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
        return new Promise((resolve) => {
            window.CrazyGames.SDK.ad.requestAd("rewarded", {
                adStarted: () => {
                    console.log("CrazyGames rewarded ad started");
                },
                adFinished: () => {
                    console.log("CrazyGames rewarded ad finished");
                    claimAdReward();
                    resolve();
                },
                adError: (error) => {
                    console.warn("CrazyGames rewarded ad error:", error);
                    showToast("Ad playback failed.");
                    resolve();
                }
            });
        });
    }

    requestBanner(containerId, width, height) {
        try {
            if (this.isLocalHost) {
                console.log(`[CrazyGames SDK Mock] requestBanner inside: ${containerId}`);
                return;
            }
            window.CrazyGames.SDK.banner.requestBanner({
                id: containerId,
                width: width,
                height: height
            });
        } catch (e) {
            console.warn("CrazyGames requestBanner error:", e);
        }
    }

    clearBanner(containerId) {
        try {
            if (this.isLocalHost) {
                console.log(`[CrazyGames SDK Mock] clearBanner: ${containerId}`);
                return;
            }
            window.CrazyGames.SDK.banner.clearBanner(containerId);
        } catch (e) {
            console.warn("CrazyGames clearBanner error:", e);
        }
    }

    exitGame() {
        showToast("Thanks for playing on CrazyGames!");
    }
}

window.Platform = Platform;
